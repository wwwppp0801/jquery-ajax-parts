add an jquery ajax dataType "parts", execute "parts" callbacks when onreadystatechange and readyState==3

```javascript
var xhr=$.ajax({
    dataType:"parts",
    url:"/baidu/www/src/static/global/js/instant_search1.js",
    success:function(){
        alert("aa");
    },
    parts:function(text){
        console.debug(text);
    }
});
xhr.parts(function(data){
    console.log(data);
});
```

