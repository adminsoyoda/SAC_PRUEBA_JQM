	var MINUS_TIME_SECOND=(1*60*1000);
    var searchGPS=false;
    //BDActualizacion("CREATE TABLE IF NOT EXISTS orden_venta(ID INTEGER PRIMARY KEY AUTOINCREMENT,DESCRIPCION TEXT,LATITUD float8,LONGITUD float8,PRECISION float8)");
	BDActualizacion("CREATE TABLE IF NOT EXISTS APP_GPS_REGISTRO(ID INTEGER PRIMARY KEY AUTOINCREMENT,ESTADO CHAR(1) not null,LATITUD float8,LONGITUD float8,PRECISION float8,SENTENCIA TEXT,FECHA_CREACION DATETIME null,ULTIMA_FECHA DATETIME null,FLAG INTEGER)");
	
    function fecActualizacion() {
        var today = new Date();
        var currentdate = new Date(today.getTime() - (MINUS_TIME_SECOND));
        var Year    = currentdate.getFullYear();
        var mes     = currentdate.getMonth() + 1;
        var day = currentdate.getDate();
        var hour    = currentdate.getHours();
        var minute = currentdate.getMinutes();
        var second = currentdate.getSeconds();

        if (String(mes).length == 1) {
            mes = '0' + mes;
        }
        if (String(day).length == 1) {
            day = '0' + day;
        }
        if (String(hour).length == 1) {
            hour = '0' + hour;
        }
        if (String(minute).length == 1) {
            minute = '0' + minute;
        }
        if (String(second).length == 1) {
            second = '0' + second;
        }

        var datetime = Year + "-" + mes + "-" + day + " " + hour + ":" + minute + ":" + second;
        return datetime;
    }

    var objGps=new objectGPS();

	function updateGPSinObjects(errorFunction,callback){
        var db = window.openDatabase(DATABASE_NAME, DATABASE_VERSION, DATABASE_DESCRIPTION, DATABASE_SIZE);
        var COLUMNS=["ID","ESTADO","LATITUD","LONGITUD","PRECISION"];
        db.transaction(callback);
        db.transaction(function(tx){          
            /************************/
            tx.executeSql("SELECT ID,ESTADO,LATITUD,LONGITUD,PRECISION,SENTENCIA FROM APP_GPS_REGISTRO WHERE ESTADO='P' AND SENTENCIA IS NOT NULL", [], function(tx,results){
                for (var i=0; i< results.rows.length; i++) {
                    var row=results.rows.item(i);
                    var sql=row["SENTENCIA"];
                    var ACTIVE_ID=row["ID"];
                    for (objValue in COLUMNS){
                        var FIELD_REPLACE="{"+COLUMNS[objValue]+"}";
                        var VALUE_REPLACE=row[COLUMNS[objValue]];
                        while (sql.indexOf(FIELD_REPLACE)!== -1){
                           sql=sql.replace(FIELD_REPLACE,VALUE_REPLACE);
                        }                        
                    }
                    tx.executeSql(sql,[],function(tx,results){
                        tx.executeSql("UPDATE APP_GPS_REGISTRO set ESTADO=? WHERE ID=?", ['F',ACTIVE_ID]);
                    });                    
                }
         });
        },errorFunction);

    }

    setInterval(function(){  
        var errorFunction=function(error){alert(error);};        
        var FECHA_ACTUALIZACION=fecActualizacion();
        updateGPSinObjects(errorFunction,function(tx){
            /************************/
            tx.executeSql("SELECT ID FROM APP_GPS_REGISTRO WHERE ESTADO=? AND ULTIMA_FECHA IS NULL AND FECHA_CREACION<=?", ['I',FECHA_ACTUALIZACION], function(tx,results){
                if(results.rows.length>0) {
                    if (!searchGPS){
                        objGps.continueGps(function(){
                            searchGPS=true;
                            objGps.getCurrentPosition(function(coordenates){
                                BDActualizacionObj("UPDATE APP_GPS_REGISTRO set ESTADO=?,FLAG=?,ULTIMA_FECHA=?,LATITUD=?,LONGITUD=?,PRECISION=? WHERE ESTADO='I' AND ULTIMA_FECHA IS NULL AND FECHA_CREACION<=?",[['P',2,fecActual(),coordenates["latitude"],coordenates["longitude"],coordenates["accuracy"],FECHA_ACTUALIZACION]]);    
                                searchGPS=false;
                            },errorFunction);
                        },function(){});
                    }
                }
            });
        }); 
    }, 10000);
