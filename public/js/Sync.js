
var syncServer = 'http://10.122.3.145:81/SAC/Sync';
//var syncServer = 'http://186.5.36.149:94/SAC/Sync';

var PROJECT_ID_GOOGLE = "994360885610";
var admPass = "sa";
var DATABASE_NAME="SAC";
var DATABASE_VERSION="1.0";
var DATABASE_DESCRIPTION="SAC Gestion Ventas Soyoda";
var DATABASE_SIZE=200000;

//-------------------------------------------------------------------------------------------------
//VARIABLES DE SINCRONIZACION

var index = 0;
var strAction="";
var strType="";
var regTable = [];
var regTableColum = [];
var regTableAction = [];
var regTableFinAction = [];
var regColumType = [];
var regFieldsUpdate = [];
var regFieldExist = [];

//-------------------------------------------------------------------------------------------------
//FUNCIONES BASE DE DATOS
function errorCB(err) { alert("Error processing SQL: " + err.code + " - " + err.name); }
function successCB() { }

function BDConsulta(sqlCommand, RESULTADO) {
    var db = window.openDatabase(DATABASE_NAME, DATABASE_VERSION, DATABASE_DESCRIPTION, DATABASE_SIZE);
    db.transaction(function (tx) {
        tx.executeSql(sqlCommand, [], function (tx, rs) {
            var result = [];
            for(var i = 0; i < rs.rows.length; i++) {
                var row = rs.rows.item(i)
            }
            RESULTADO(row);
        })
    }, errorCB, successCB);
}

function BDActualizacion(sqlCommand) {
    var db = window.openDatabase(DATABASE_NAME, DATABASE_VERSION, DATABASE_DESCRIPTION, DATABASE_SIZE);
    db.transaction(function (tx) { tx.executeSql(sqlCommand) }, errorCB, successCB);
}

function BDConsultaOBJ(sqlCommand, RESULTADO) {
    var db = window.openDatabase(DATABASE_NAME, DATABASE_VERSION, DATABASE_DESCRIPTION, DATABASE_SIZE);
    db.transaction(function (tx) {
        tx.executeSql(sqlCommand, [], function (tx, rs) {
            RESULTADO(rs);
        })
    }, errorCB, successCB);
}

function BDActualizacionObj(sqlCommand,Obj) {
    var db = window.openDatabase(DATABASE_NAME, DATABASE_VERSION, DATABASE_DESCRIPTION, DATABASE_SIZE);
    db.transaction(function(tx){
        for (objValue in Obj){
            tx.executeSql(sqlCommand,Obj[objValue]);
        }
    }, errorCB, successCB);    
}

 function BDActualizacionObjWithCallback(sqlCommand,Obj,callback){     
    var db = window.openDatabase(DATABASE_NAME, DATABASE_VERSION, DATABASE_DESCRIPTION, DATABASE_SIZE);
    db.transaction(function(tx){
       tx.executeSql(sqlCommand,Obj,callback);        
    }, errorCB, successCB);   
}


function SyncExeReady(CODIGOINTERNO,TIPOSYNC, RETORNO) {
    $("#loader_sys_btn_show").click();
    var dataPost = {
        CODIGOINTERNO: CODIGOINTERNO
    };
    AjaxSAC(syncServer + "/" + TIPOSYNC, dataPost, true, function (callback) {
        $("#sync_sys").html(callback);
        $("#loader_sys_btn_hide").click();
        RETORNO("OK");
        return true;
    });
}
                    

function SyncExe(CODIGOINTERNO,INISYNC, RETORNO) {
    $("#loader_sys_btn_show").click();
    var dataPost = {
        CODIGOINTERNO: CODIGOINTERNO,
        INISYNC:INISYNC,
        LOADER:INISYNC
    };
    AjaxSAC(syncServer + "/SyncExe", dataPost, true, function (callback) {
        $("#sync_sys").html(callback);
        $("#loader_sys_btn_hide").click();
        RETORNO("OK");
        return true;
    });
}

function SyncProcess(loader) {
    var CODIGOINTERNO = '';
    var FECHAANT = '';
    
    BDConsultaOBJ("SELECT * FROM APP_USUARIO;", function (obj) {
        for (var i = 0; i < obj.rows.length; i++) {
            var row = obj.rows.item(i);
            CODIGOINTERNO = row.IDUSERWEB;
        }
   
        var dataPost = {
            CODIGOINTERNO: CODIGOINTERNO,
            INISYNC: false,
            LOADER:loader
        };

        AjaxSAC(syncServer + "/SyncExe", dataPost, loader, function (callback) {
            $("#sync_sys").html(callback);
            return true;
        });
    });
}

function SyncExeSendInfo(sqlCommand,table,loader) {
    if (loader) { $("#loader_sys").show(); }
    BDConsultaOBJ(sqlCommand, function (obj) {
        var objString=""; 
        var result = [];
        for (var i=0;i<obj.rows.length;i++) {
            result.push(obj.rows.item(i));
        }
        objString = JSON.stringify(result, null, 2);
        var dataPost = {
            OBJECTDATA: objString,
            TABLE: table
        };
        AjaxSAC(syncServer + "/SyncDeviceInfo"+table, dataPost, loader, function (callback) {
            if (loader) {
                alerta(callback);
            }
            return true;
        });
    });
}


function SyncApp_Web(TableSelect, TableAction, TableFinAction, ColumType, detailColum,FieldsUpdate,FielsdExist,alerta,msg,loader){
    if (loader) { $("#loader_sys_btn_show").click(); }
    index=0;
    strAction="";
	regTable = TableSelect.split("@@");
	regTableColum = detailColum.split("@@");
	regTableAction = TableAction.split("@@");
	regTableFinAction = TableFinAction.split("@@");
	regColumType = ColumType.split("@@");
	regFieldsUpdate = FieldsUpdate.split("@@");
	regFieldExist = FielsdExist.split("@@");  
    SyncAppWebExec(alerta,msg,loader);
}

function SyncAppWebExec(alerta,msg,loader){

    if(index < regTable.length){
	    BDConsultaOBJ( regTable[index] , function (obj){    
	        for (var j = 0; j < obj.rows.length; j++) {        
	            var row = obj.rows.item(j);

	            var actionStr = ((index > 0)? ((j==0)?'|':'') : '')+regTableAction[index] ;
	            var regColum = regTableColum[index].split("|");
	            for (var k = 0; k < regColum.length; k++)
	            {
	                if (regColumType[index] == "IN"){
	                    actionStr = actionStr + ((k == 0) ? "'" : ",'") + ((row[regColum[k]]== null) ? '0': row[regColum[k]]) + "'";
	                }
	                else{
	                    actionStr = actionStr + ((k == 0) ? "" : ",") + regColum[k] + "='"+ ((row[regColum[k]]==null) ? '0': row[regColum[k]] )+"'";
	                }
	            }
	            
	            actionStr = actionStr + regTableFinAction[index] 
				
				var regFieldExistItems = regFieldExist[index].split("|");
	            for (var m = 0; m < regFieldExistItems.length; m++)
	            {
	            	if(m==0){
	            		actionStr = actionStr + regFieldExistItems[m];
	            	}else{
	            		actionStr = actionStr + ((m == 1) ? " " : " AND ") +regFieldExistItems[m]+ " ='"+ row[regFieldExistItems[m]] +"'";
	            	}
	                
	            }
	            var regFieldsUpdateAll= regFieldsUpdate[index].split("$");
	            var regFieldsUpdateItems = regFieldsUpdateAll[0].split("|");
	            for (var l = 0; l < regFieldsUpdateItems.length; l++)
	            {
	            	if(l==0){
	            		actionStr = actionStr + regFieldsUpdateItems[l];
	            	}else{
	                	actionStr = actionStr + ((l == 1) ? "" : " AND ") +regFieldsUpdateItems[l] + "='"+ row[regFieldsUpdateItems[l]] +"'";
	            	}
	            }

	            actionStr = actionStr + "}" +regFieldsUpdateAll[1]

	            actionStr = ((j > 0)? '|' : '') + actionStr  ;
	            strType = strType+ "|"+ regColumType[index];
	            strAction=strAction+actionStr;
	        }
	        index++;
	        SyncAppWebExec(alerta,msg,loader);
	    });
	}else{
		dataPost={     
            STRACTION : strAction,
            TYPE : strType,
            IDGOOGLE : registerId,
            USR : masterUsuario
        }
        AjaxSAC(syncServer+'/SyncAppWebExe', dataPost, loader, function (callback) {
            if (loader) { $("#loader_sys_btn_show").click(); }

            if(alerta){
                alert(callback);
            } 

            var regcallbackAll = callback.split("$");
            var regcallback = regcallbackAll[0].split("|");

            regcallback = regcallback.filter(Boolean)

            for (var i = 0; i < regcallback.length; i++)
            {
                BDActualizacion(regcallback[i]);
            }

            if(msg)
            {
            	alert(regcallbackAll[1]);
                $("#loader_sys_btn_hide").click();
                $("#sync_sys").html("");
            }
        });
	}
}
