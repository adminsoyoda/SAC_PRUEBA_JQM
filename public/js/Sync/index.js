var registerId="";//variable contenedora de id
var app = {
    // Application Constructor 
    initialize: function (callback) {
        this.bindEvents();

        callback();
    },    
    // Bind Event Listeners 
    // 
    // Bind any events that are required on startup. Common events are: 
    // 'load', 'deviceready', 'offline', and 'online'. 
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("pause", this.onDeviceReady, false);
    },
    // deviceready Event Handler 
    // 
    // The scope of 'this' is the event. In order to call the 'receivedEvent' 
    // function, we must explicity call 'app.receivedEvent(...);' 
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event 
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);
        var pushNotification = window.plugins.pushNotification;
        if (device.platform == 'android' || device.platform == 'Android') {
            //alert("Register called");
            //tu Project ID aca!! 
            pushNotification.register(this.successHandler, this.errorHandler, { "senderID": PROJECT_ID_GOOGLE, "ecb": "app.onNotificationGCM" });
        }
        else {
            //alert("Register called");
            pushNotification.register(this.successHandler, this.errorHandler, { "badge": "true", "sound": "true", "alert": "true", "ecb": "app.onNotificationAPN" });
        }
    },
    // result contains any message sent from the plugin call 
    successHandler: function (result) {
        //alert('Callback Success! Result = ' + result)
    },
    errorHandler: function (error) {
        alert(error);
    },
    onNotificationGCM: function (e) {
        var message_sync_div = $("#message_sync");
         
        switch (e.event) {
            case 'registered':
                if (e.regid.length > 0) {
                    registerId= e.regid;
                }
                break;
            case 'message':
                message_sync_div.html(e.payload.exec);
                
                dataPost={     
                    USR : masterUsuario,
                    MSG : e.payload.message,
                    EXEC : e.payload.accion
                }
                AjaxSAC(syncServer+'/SyncPushReturn', dataPost, false, function (callback) {
                    $("#sync_sys").html(callback);
                });   
                
                break;
            case 'error':
                break;
               // document.getElementById("ID_ORDEN").value=
            default:
                break;
        }
    },
    onNotificationAPN: function (event) {
        var pushNotification = window.plugins.pushNotification;
        alert("Running in JS - onNotificationAPN - Received a notification! " + event.alert);
        if (event.alert) {
            navigator.notification.alert(event.alert);
        }
        if (event.badge) {
            pushNotification.setApplicationIconBadgeNumber(this.successHandler, this.errorHandler, event.badge);
        }
        if (event.sound) {
            var snd = new Media(event.sound);
            snd.play();
        }
    }
};

function setIdRegistered(){//asiginar id de google
    //alert(registerId);
    document.getElementById('IDGOOGLE').value = registerId;
}
