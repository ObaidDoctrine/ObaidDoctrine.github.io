package com.obaiddoctrine.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

final class SecureSessionStore {
    private static final String PREFS="obaidmind_auth";
    private static final String KEY_ALIAS="obaidmind_auth_key_v1";
    private static final String SESSION="session";
    private static final String PKCE="pkce_verifier";
    private final SharedPreferences prefs;

    SecureSessionStore(Context c){prefs=c.getSharedPreferences(PREFS,Context.MODE_PRIVATE);}

    void saveSession(NhostApi.Session s)throws Exception{
        JSONObject j=new JSONObject();
        j.put("accessToken",s.accessToken);j.put("refreshToken",s.refreshToken);j.put("accessTokenExpiresAt",s.accessTokenExpiresAt);j.put("user",s.user);
        put(SESSION,j.toString());
    }
    NhostApi.Session loadSession()throws Exception{
        String raw=get(SESSION);if(raw==null)return null;JSONObject j=new JSONObject(raw);
        return new NhostApi.Session(j.getString("accessToken"),j.getString("refreshToken"),j.getLong("accessTokenExpiresAt"),j.optJSONObject("user"));
    }
    void clearSession(){prefs.edit().remove(SESSION).apply();}
    void savePkceVerifier(String v)throws Exception{put(PKCE,v);}
    String consumePkceVerifier()throws Exception{String v=get(PKCE);prefs.edit().remove(PKCE).apply();return v;}

    private void put(String name,String value)throws Exception{
        byte[] iv=new byte[12];new java.security.SecureRandom().nextBytes(iv);
        Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,key(),new GCMParameterSpec(128,iv));
        byte[] enc=cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
        prefs.edit().putString(name,Base64.encodeToString(iv,Base64.NO_WRAP)+":"+Base64.encodeToString(enc,Base64.NO_WRAP)).apply();
    }
    private String get(String name)throws Exception{
        String packed=prefs.getString(name,null);if(packed==null)return null;String[] p=packed.split(":",2);if(p.length!=2)return null;
        Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Base64.decode(p[0],Base64.NO_WRAP)));
        return new String(cipher.doFinal(Base64.decode(p[1],Base64.NO_WRAP)),StandardCharsets.UTF_8);
    }
    private SecretKey key()throws Exception{
        KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);
        if(ks.containsAlias(KEY_ALIAS))return ((KeyStore.SecretKeyEntry)ks.getEntry(KEY_ALIAS,null)).getSecretKey();
        KeyGenerator g=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
        g.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());
        return g.generateKey();
    }
}