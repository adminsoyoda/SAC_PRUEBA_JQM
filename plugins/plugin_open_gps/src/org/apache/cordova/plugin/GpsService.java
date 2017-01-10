package org.apache.cordova.plugin;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;
import org.json.JSONArray;
import android.os.Bundle;
import android.location.LocationManager;
import android.provider.Settings;
import android.content.Intent;
import android.net.Uri;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.content.Context;
import org.json.JSONException;
import org.json.JSONObject;


import android.app.Activity;
import android.app.IntentService;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

public class GpsService extends CordovaPlugin{

    @Override
    public boolean execute(String action, final JSONArray args, CallbackContext callbackContext) {
        try{
          PluginResult result = new PluginResult(Status.OK);
          boolean value=false;
          if ("on".equals(action)){
              value=switchOn();
          }else if ("off".equals(action)){
              value=switchOff();
          }else if ("provider_enabled".equals(action)){
              value=isProviderEnabled();
              JSONObject jo = new JSONObject();
              jo.put("value", value);
              callbackContext.sendPluginResult(new PluginResult(Status.OK, jo));
          }else{
              result = new PluginResult(Status.INVALID_ACTION);
              callbackContext.sendPluginResult(result);
          }  
          return true;
        }catch(JSONException e){
          callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
          return false;
        }
    }

    public boolean switchOn(){
  		final Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
  		cordova.getActivity().startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
      return true;
    }

    public boolean switchOff(){
      final Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
      cordova.getActivity().startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
      return true;
    }
    
    public boolean isProviderEnabled(){
      LocationManager handle=(LocationManager) cordova.getActivity().getApplicationContext().getSystemService(Context.LOCATION_SERVICE);
	    boolean isGPSEnabled = handle.isProviderEnabled(LocationManager.GPS_PROVIDER);	
	    return isGPSEnabled;
	  }   


}