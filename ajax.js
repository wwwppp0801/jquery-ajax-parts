(function(){
$.ajaxPrefilter("parts",function(s,originalSettings, jqXHR){
    s.__partsCallback=[];
    s.__partsIndex=0;
    jqXHR.parts=function(callback){
        s.__partsCallback.push(callback);
    };
    if(s.parts){
        jqXHR.parts(s.parts);
    }
    s.converters["* parts"]=function(text){
        return text;
    };
});
$.ajaxTransport("parts",function(options){
    if ( !options.crossDomain || support.cors ) {
        var callback;
        return {
            send: function( headers, complete ) {
                var i,
                    xhr = options.xhr();

                // Open the socket
                xhr.open( options.type, options.url, options.async, options.username, options.password );

                // Apply custom fields if provided
                if ( options.xhrFields ) {
                    for ( i in options.xhrFields ) {
                        xhr[ i ] = options.xhrFields[ i ];
                    }
                }

                // Override mime type if needed
                if ( options.mimeType && xhr.overrideMimeType ) {
                    xhr.overrideMimeType( options.mimeType );
                }

                // X-Requested-With header
                // For cross-domain requests, seeing as conditions for a preflight are
                // akin to a jigsaw puzzle, we simply never set it to be sure.
                // (it can always be set on a per-request basis or even using ajaxSetup)
                // For same-domain requests, won't change header if already provided.
                if ( !options.crossDomain && !headers["X-Requested-With"] ) {
                    headers["X-Requested-With"] = "XMLHttpRequest";
                }

                // Set headers
                for ( i in headers ) {
                    // Support: IE<9
                    // IE's ActiveXObject throws a 'Type Mismatch' exception when setting
                    // request header to a null-value.
                    //
                    // To keep consistent with other XHR implementations, cast the value
                    // to string and ignore `undefined`.
                    if ( headers[ i ] !== undefined ) {
                        xhr.setRequestHeader( i, headers[ i ] + "" );
                    }
                }

                // Do send the request
                // This may raise an exception which is actually
                // handled in jQuery.ajax (so no try/catch here)
                xhr.send( ( options.hasContent && options.data ) || null );

                // Listener
                callback = function( _, isAbort ) {
                    var status, statusText, responses,i;

                    if ((xhr.readyState===3||xhr.readyState===4)
                            &&!isAbort){
                        (function(){
                            var delimiter=options.delimiter,responseText=xhr.responseText,offset=-1,lastOffset,i;
                            if(delimiter){
                                while(true){
                                    for(i=0;i<=options.__partsIndex;i++){
                                        lastOffset=(offset==-1)?0:offset+delimiter.length;
                                        offset=responseText.indexOf(delimiter,lastOffset);
                                        if(offset==-1){
                                            break;
                                        }
                                    }
                                    if(offset==-1 && xhr.readyState!==4){
                                        return;
                                    }
                                    for(i=0;i<options.__partsCallback.length;i++){
                                        options.__partsCallback[i].call(xhr,
                                            responseText.substring(lastOffset,offset==-1?responseText.length:offset),
                                            options.__partsIndex,
                                            responseText);
                                    }
                                    options.__partsIndex++;
                                    if(offset==-1){
                                        return;
                                    }
                                    offset=-1;
                                }
                            }else{
                                for(i=0;i<options.__partsCallback.length;i++){
                                    options.__partsCallback[i].call(xhr,responseText);
                                }
                            }
                        })();
                    } 
                    // Was never called and is aborted or complete
                    if ( callback && ( isAbort || xhr.readyState === 4 ) ) {
                        // Clean up
                        callback = undefined;
                        xhr.onreadystatechange = jQuery.noop;

                        // Abort manually if needed
                        if ( isAbort ) {
                            if ( xhr.readyState !== 4 ) {
                                xhr.abort();

                            }
                        }else{
                            responses = {};
                            status = xhr.status;

                            // Support: IE<10
                            // Accessing binary-data responseText throws an exception
                            // (#11426)
                            if ( typeof xhr.responseText === "string" ) {
                                responses.text = xhr.responseText;
                            }

                            // Firefox throws an exception when accessing
                            // statusText for faulty cross-domain requests
                            try {
                                statusText = xhr.statusText;
                            } catch( e ) {
                                // We normalize with Webkit giving an empty statusText
                                statusText = "";
                            }

                            // Filter status for non standard behaviors

                            // If the request is local and we have data: assume a success
                            // (success with no data won't get notified, that's the best we
                            // can do given current implementations)
                            if ( !status && options.isLocal && !options.crossDomain ) {
                                status = responses.text ? 200 : 404;
                            // IE - #1450: sometimes returns 1223 when it should be 204
                            } else if ( status === 1223 ) {
                                status = 204;
                            }
                        }
                    }

                    // Call complete if needed
                    if ( responses ) {
                        complete( status, statusText, responses, xhr.getAllResponseHeaders() );
                    }
                };

                if ( !options.async ) {
                    // if we're in sync mode we fire the callback
                    callback();
                } else if ( xhr.readyState === 4 ) {
                    // (IE6 & IE7) if it's in cache and has been
                    // retrieved directly we need to fire the callback
                    setTimeout( callback );
                } else {
                    // Add to the list of active xhr callbacks
                    xhr.onreadystatechange =  callback;
                }
            },

            abort: function() {
                if ( callback ) {
                    callback( undefined, true );
                }
            }
        };
    }
});
})();
