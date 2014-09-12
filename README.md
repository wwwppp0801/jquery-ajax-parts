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

support <b>delimiter</b> param, auto split responseText to parts, every part will be processed by callback

```javascript
var xhr=$.ajax({
    dataType:"parts",
    delimiter:"/*3*/",
    url:"test_data.php"
});
xhr.parts(function(part,index,all){
    $("#container").append("<h1>"+index+"</h1>");
    $("#container").append(part);
});
```
