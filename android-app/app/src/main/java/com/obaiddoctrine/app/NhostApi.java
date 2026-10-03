package com.obaiddoctrine.app;

import org.json.JSONException;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

final class NhostApi {
    interface Callback<T> { void onSuccess(T value); void onError(ApiException error); }

    static final class Session {
        final String accessToken, refreshToken;
        final long accessTokenExpiresAt;
        final JSONObject user;
        Session(String a, String r, long e, JSONObject u) {
            accessToken=a; refreshToken=r; accessTokenExpiresAt=e; user=u==null?new JSONObject():u;
        }
    }

    static final class ApiException extends Exception {
        final int status; final String code;
        ApiException(int s,String c,String m){super(m==null||m.trim().isEmpty()?"Authentication request failed.":m);status=s;code=c==null?"":c;}
    }

    private final ExecutorService executor=Executors.newCachedThreadPool();
    void shutdown(){executor.shutdownNow();}

    void signUp(String email,String password,String challenge,Callback<JSONObject> cb){
        JSONObject body=new JSONObject(), options=new JSONObject();
        try{options.put("redirectTo",NhostConfig.VERIFICATION_REDIRECT);body.put("email",email);body.put("password",password);body.put("options",options);body.put("codeChallenge",challenge);}
        catch(JSONException e){cb.onError(new ApiException(0,"invalid-request","Unable to prepare the request."));return;}
        postAsync("/signup/email-password",body,null,cb);
    }

    void signIn(String email,String password,Callback<Session> cb){
        JSONObject body=new JSONObject();
        try{body.put("email",email);body.put("password",password);}
        catch(JSONException e){cb.onError(new ApiException(0,"invalid-request","Unable to prepare the request."));return;}
        postAsync("/signin/email-password",body,null,r->{try{cb.onSuccess(parseSession(r));}catch(JSONException e){cb.onError(new ApiException(0,"invalid-response","The authentication response was invalid."));}});
    }

    void refresh(String refreshToken,Callback<Session> cb){
        JSONObject body=new JSONObject();
        try{body.put("refreshToken",refreshToken);}
        catch(JSONException e){cb.onError(new ApiException(0,"invalid-request","Unable to prepare the request."));return;}
        postAsync("/token",body,null,r->{try{cb.onSuccess(parseSession(r));}catch(JSONException e){cb.onError(new ApiException(0,"invalid-response","The session response was invalid."));}});
    }

    void tokenExchange(String code,String verifier,Callback<Session> cb){
        JSONObject body=new JSONObject();
        try{body.put("code",code);body.put("codeVerifier",verifier);}
        catch(JSONException e){cb.onError(new ApiException(0,"invalid-request","Unable to prepare the request."));return;}
        postAsync("/token/exchange",body,null,r->{try{cb.onSuccess(parseSession(r));}catch(JSONException e){cb.onError(new ApiException(0,"invalid-response","The verification response was invalid."));}});
    }

    void resendVerification(String email,Callback<String> cb){
        JSONObject body=new JSONObject(), options=new JSONObject();
        try{options.put("redirectTo",NhostConfig.VERIFICATION_REDIRECT);body.put("email",email);body.put("options",options);}
        catch(JSONException e){cb.onError(new ApiException(0,"invalid-request","Unable to prepare the request."));return;}
        postAsync("/user/email/send-verification-email",body,null,r->cb.onSuccess("OK"));
    }

    void requestPasswordReset(String email,String challenge,Callback<String> cb){
        JSONObject body=new JSONObject(), options=new JSONObject();
        try{options.put("redirectTo",NhostConfig.PASSWORD_RESET_REDIRECT);body.put("email",email);body.put("options",options);body.put("codeChallenge",challenge);}
        catch(JSONException e){cb.onError(new ApiException(0,"invalid-request","Unable to prepare the request."));return;}
        postAsync("/user/password/reset",body,null,r->cb.onSuccess("OK"));
    }

    void changePassword(String accessToken,String newPassword,Callback<String> cb){
        JSONObject body=new JSONObject();
        try{body.put("newPassword",newPassword);}
        catch(JSONException e){cb.onError(new ApiException(0,"invalid-request","Unable to prepare the request."));return;}
        postAsync("/user/password",body,accessToken,r->cb.onSuccess("OK"));
    }

    void signOut(String refreshToken,Callback<String> cb){
        JSONObject body=new JSONObject();
        try{body.put("refreshToken",refreshToken);}
        catch(JSONException e){cb.onError(new ApiException(0,"invalid-request","Unable to prepare the request."));return;}
        postAsync("/signout",body,null,r->cb.onSuccess("OK"));
    }

    private void postAsync(String path,JSONObject body,String accessToken,Callback<JSONObject> cb){
        executor.execute(()->{try{cb.onSuccess(post(path,body,accessToken));}catch(ApiException e){cb.onError(e);}catch(Exception e){cb.onError(new ApiException(0,"network-error","Unable to connect. Please check your internet connection and try again."));}});
    }

    private JSONObject post(String path,JSONObject body,String accessToken)throws Exception{
        if(!NhostConfig.isConfigured())throw new ApiException(0,"not-configured","Nhost project configuration is missing.");
        HttpURLConnection c=(HttpURLConnection)new URL(NhostConfig.authBaseUrl()+path).openConnection();
        c.setRequestMethod("POST");c.setConnectTimeout(15000);c.setReadTimeout(20000);c.setDoOutput(true);
        c.setRequestProperty("Accept","application/json");c.setRequestProperty("Content-Type","application/json; charset=UTF-8");
        if(accessToken!=null&&!accessToken.isEmpty())c.setRequestProperty("Authorization","Bearer "+accessToken);
        try(OutputStream out=c.getOutputStream()){out.write(body.toString().getBytes(StandardCharsets.UTF_8));}
        int status=c.getResponseCode();InputStream stream=status>=200&&status<300?c.getInputStream():c.getErrorStream();String raw=read(stream);c.disconnect();
        JSONObject json=raw.isEmpty()?new JSONObject():new JSONObject(raw);
        if(status<200||status>=300)throw new ApiException(status,json.optString("error",""),json.optString("message","Authentication request failed."));
        return json;
    }

    private static String read(InputStream stream)throws Exception{
        if(stream==null)return "";
        StringBuilder out=new StringBuilder();
        try(BufferedReader r=new BufferedReader(new InputStreamReader(stream,StandardCharsets.UTF_8))){String line;while((line=r.readLine())!=null)out.append(line);}
        return out.toString();
    }

    private static Session parseSession(JSONObject response)throws JSONException{
        JSONObject s=response.optJSONObject("session");if(s==null)throw new JSONException("Missing session");
        String a=s.getString("accessToken"),r=s.getString("refreshToken");long expires=System.currentTimeMillis()+s.optLong("accessTokenExpiresIn",900L)*1000L;
        return new Session(a,r,expires,s.optJSONObject("user"));
    }
}