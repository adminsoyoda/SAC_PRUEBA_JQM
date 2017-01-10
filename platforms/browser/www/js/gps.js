var TIMEOUT_SEARCH=15000;//milisegundos

    /**objeto gps**/
    function objectGPS(){
        this.transactionRecords=0;         
    }

    /**registros procesandose**/
    objectGPS.prototype.getStatusRecords=function(){
        return this.transactionRecords;
    }


    /**obtener valores de objeto posicion,retorno un diccionario**/
    objectGPS.prototype.getValuesFromPosition= function(show,flag,position){
        var coordenates={'latitude':position.coords.latitude,
                    'longitude':position.coords.longitude,
                    'accuracy':position.coords.accuracy,
                    'altitudeAccuracy':position.coords.altitudeAccuracy,
                    'heading':position.coords.heading,
                    'speed':position.coords.speed,
                    'timestamp':position.coords.timestamp,
                    'flag':flag
                };
        if(show){
            alert('Latitude: '          + position.coords.latitude          + '\n' +
                          'Longitude: '         + position.coords.longitude         + '\n' +
                          'Altitude: '          + position.coords.altitude          + '\n' +
                          'Accuracy: '          + position.coords.accuracy          + '\n' +
                          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                          'Heading: '           + position.coords.heading           + '\n' +
                          'Speed: '             + position.coords.speed             + '\n' +
                          'Timestamp: '         + position.timestamp                + '\n'+
                          'Flag: '         + flag                + '\n');
            }
        return coordenates;
    }

    /**obtener las coordenadas ,busqueda por precion alta caso contrario precion baja**/
    objectGPS.prototype.getCoordenates=function(callbackWithValues,callbackError,showAlert,updateSQL){
        var show=showAlert|| false;
        var updateSQLSentence=updateSQL|| null;
        var self=this;
        var exitError=function(error){
            if(show){
                alert('code: '    + error.code    + '\n' +'message: ' + error.message + '\n');
            }
            callbackError(error);
        };
        this.executeGPSSearch(self,show,callbackWithValues,
                function(error) {
                    self.executeGPSSearch(self,show,callbackWithValues,exitError,{},true,updateSQLSentence);
                },{enableHighAccuracy:true,timeout:TIMEOUT_SEARCH},false,updateSQLSentence);
    }
    
    /**ejecucino de metodos para obtener las coordenadas**/
    objectGPS.prototype.executeGPSSearch=function(self,show,callbackWithValues,callbackError,options,flag,updateSQLSentence){
        var coordenates={};        
        this.transactionRecords=this.transactionRecords+1;
        BDActualizacionObjWithCallback("INSERT INTO APP_GPS_REGISTRO(ESTADO,FECHA_CREACION,SENTENCIA,FLAG)VALUES(?,?,?,?)",['I',fecActual(),updateSQLSentence,0],
        function(tx,results){
           var INSERT_ID=results.insertId; 
           navigator.geolocation.getCurrentPosition(
                function(position) {
                    coordenates=self.getValuesFromPosition(show,flag,position);                    
                    BDActualizacionObjWithCallback("UPDATE APP_GPS_REGISTRO SET ESTADO=?,LATITUD=?,LONGITUD=?,PRECISION=?,ULTIMA_FECHA=?,FLAG=? WHERE ID=?",['P',coordenates["latitude"],coordenates["longitude"],coordenates["accuracy"],fecActual(),1,INSERT_ID],function(tx,results){}); 
                    this.transactionRecords=this.transactionRecords-1;
                    callbackWithValues(coordenates);
                },function(error){
                    this.transactionRecords=this.transactionRecords-1;
                    callbackError(error);
                },options);                 
        });
    }

    /****/
    objectGPS.prototype.executeGPS=function(callbackWithValues,callbackError,options){
        var coordenates={};        
        var self=this;
        navigator.geolocation.getCurrentPosition(
            function(position) {
                coordenates=self.getValuesFromPosition(false,false,position);                    
                callbackWithValues(coordenates);
            },function(error){callbackError(error);},options);
    }

    objectGPS.prototype.getCurrentPosition=function(callbackWithValues,callbackError){
        try{
            var self=this;
        var exitError=function(error){
            alert('code: '    + error.code    + '\n' +'message: ' + error.message + '\n');            
            callbackError(error);
        };
        self.executeGPS(callbackWithValues,
                function(error) {
                    self.executeGPS(callbackWithValues,exitError,{});
                },{enableHighAccuracy:true,timeout:TIMEOUT_SEARCH});
        
        }catch(err){
            alert(err);
        }
        }

    /**mostrar coordenadas mendiante un alert**/
    objectGPS.prototype.showCoordenates=function(){
        this.getCoordenates(function(coordenates){

        },function(error) {

        },true,null);
    }

    /**verifica si el gps esta activo**/
    objectGPS.prototype.isGpsActive=function(){
        var value=false;
        cordova.plugins.diagnostic.isLocationEnabled(
            function(enabled){
                value=enabled;            
            }, 
            function(error){
                value=false;
            }); 
        return value;
    }

    /**ejecuta si y solo si .el gps esta activo**/
    objectGPS.prototype.continueGps=function(callbackIfTrue,callbackIfFalse){
        var pass=true;
        callbackIfTrue();
        return true;
        /*cordova.plugins.diagnostic.isLocationEnabled(
            function(enabled){
                pass=enabled;
                if (!enabled){
                    alert("Active el GPS.Para continuar.");
                    cordova.exec(function(){
                    },function(errx){alert(errx);} ,'GpsService', 'on',[{}]);  
                    callbackIfFalse();
                    return false;  
                }
                cordova.exec(function(providerEnabled){
                    pass=providerEnabled["value"];
                        if (!pass){
                            alert("Configure el método de  localización como 'SOLO GPS'.");
                            cordova.exec(function(){},function(errx){alert(errx);} ,'GpsService', 'on',[{}]);  
                            callbackIfFalse();
                            return false;  
                        }
                    },function(errx){alert(errx);} ,'GpsService', 'provider_enabled',[{}]);  
                callbackIfTrue();
                return true;
            },
            function(error){
                alert(error);
                pass=false;
            });
        return pass;*/
    }