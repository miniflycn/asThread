# asThread: Javascript线程模拟器

主页: https://github.com/miniflycn/asThread


## 目标
进行Javascript模拟线程实验。

<blockquote>
<p>jQuery中所支持的异步模型为：</p>
<ul>
<li>Callbacks，回调函数列队。</li>
<li>Deferred，延迟执行对象。</li>
<li>Promise，是Deferred只暴露非状态改变方法的对象。</li>
</ul>
<p>&nbsp;这些模型都很漂亮，但我想要另一种异步模型。</p>
</blockquote>
<p>&nbsp;</p>
<h3><span style="font-size: 14pt;"><strong>Thread？</strong></span></h3>
<p>我们知道链式操作是可以很好的表征运行顺序的（可以参考我的文章《<a class="titlelink" href="http://www.cnblogs.com/justany/archive/2013/01/17/2863101.html">jQuery链式操作</a>》），然而通常基于回调函数或者基于事件监听的异步模型中，代码的执行顺序不清晰。</p>
<p>Callbacks模型实际上类似一个自定义事件的回调函数队列，当触发该事件（调用Callbacks.fire()）时，则回调队列中的所有回调函数。</p>
<p>Deferred是个延迟执行对象，可以注册Deferred成功、失败或进行中状态的回调函数，然后通过触发相应的事件来回调函数。</p>
<p>这两种异步模型都类似于事件监听异步模型，实质上顺序依然是分离的。</p>
<p>当然Promise看似能提供我需要的东西，比如Promise.then().then().then()。但是，Promise虽然成功用链式操作明确了异步编程的顺序执行，但是没有循环，成功和失败分支是通过内部代码确定的。</p>
<p>我想要一种类似于线程的模型，我们在这里称为Thread，也就是他能顺序执行、也能循环执行、当然还有分支执行。</p>
<p>&nbsp;</p>
<h3><span style="font-size: 14pt;"><strong>顺序执行</strong></span></h3>
<p>线程的顺序执行流程，也就是类似于：</p>
<div class="cnblogs_code">
<pre><span style="color: #000000;">do1();
do2();
do3();</span></pre>
</div>
<p>这样就是依次执行do1，do2，do3。因为这是异步模型，所以我们希望能添加wait方法，即类似于：</p>
<div class="cnblogs_code">
<pre><span style="color: #000000;">do1();
wait(</span>1000);    <span style="color: #008000;">//</span><span style="color: #008000;">等待1000ms</span>
<span style="color: #000000;">do2();
wait(</span>1000);    <span style="color: #008000;">//</span><span style="color: #008000;">等待1000ms</span>
<span style="color: #000000;">do3();
wait(</span>1000);    <span style="color: #008000;">//</span><span style="color: #008000;">等待1000ms</span></pre>
</div>
<p>不使用编译方法的话，使用链式操作来表征顺序，则实现后的样子应当是这样的：</p>
<div class="cnblogs_code">
<pre>Thread().    <span style="color: #008000;">//</span><span style="color: #008000;">获取线程</span>
then(do1).    <span style="color: #008000;">//</span><span style="color: #008000;">然后执行do1</span>
wait(1000).    <span style="color: #008000;">//</span><span style="color: #008000;">等待1000ms</span>
then(do2).    <span style="color: #008000;">//</span><span style="color: #008000;">然后执行do2</span>
wait(1000).    <span style="color: #008000;">//</span><span style="color: #008000;">等待1000ms</span>
then(do3).    <span style="color: #008000;">//</span><span style="color: #008000;">然后执行do3</span>
wait(1000);    <span style="color: #008000;">//</span><span style="color: #008000;">等待1000ms</span></pre>
</div>
<p>&nbsp;</p>
<h3><span style="font-size: 14pt;"><strong>循环执行</strong></span></h3>
<p>循环这很好理解，比如for循环：</p>
<div class="cnblogs_code">
<pre><span style="color: #0000ff;">for</span>(; <span style="color: #0000ff;">true</span><span style="color: #000000;">;){
    </span><span style="color: #0000ff;">do</span><span style="color: #000000;">();
    wait(1000);
}</span></pre>
</div>
<p>进行无限次循环执行do，并且每次都延迟1000ms。则其链式表达应当是这样的：</p>
<div class="cnblogs_code">
<pre>Thread().    <span style="color: #008000;">//</span><span style="color: #008000;">获取线程</span>
loop(<span style="color: #0000ff;">-1</span>).    <span style="color: #008000;">//</span><span style="color: #008000;">循环开始，正数则表示循环正数次，负数则表示循环无限次</span>
    then(<span style="color: #0000ff;">do</span>).    <span style="color: #008000;">//</span><span style="color: #008000;">然后执行do</span>
    wait(1000).    <span style="color: #008000;">//</span><span style="color: #008000;">等待1000ms</span>
loopEnd();    <span style="color: #008000;">//</span><span style="color: #008000;">循环结束</span></pre>
</div>
<p>这个可以参考后面的例子。&nbsp;</p>
<p>&nbsp;</p>
<h3><span style="font-size: 14pt;"><strong>分支执行</strong></span></h3>
<p>分支也就是if...else，比如：</p>
<div class="cnblogs_code">
<pre><span style="color: #0000ff;">if</span>(<span style="color: #0000ff;">true</span><span style="color: #000000;">){
    doSccess();
}</span><span style="color: #0000ff;">else</span><span style="color: #000000;">{
    doFail();
}</span></pre>
</div>
<p>那么其链式实现应当是：</p>
<div class="cnblogs_code">
<pre>Thread().    <span style="color: #008000;">//</span><span style="color: #008000;">获得线程</span>
right(<span style="color: #0000ff;">true</span>).    <span style="color: #008000;">//</span><span style="color: #008000;">如果表达式正确</span>
    then(doSccess).    <span style="color: #008000;">//</span><span style="color: #008000;">执行doSccess</span>
left().    <span style="color: #008000;">//</span><span style="color: #008000;">否则</span>
    then(doFail).    <span style="color: #008000;">//</span><span style="color: #008000;">执行doFail</span>
leftEnd().    <span style="color: #008000;">//</span><span style="color: #008000;">left分支结束</span>
rightEnd();    <span style="color: #008000;">//</span><span style="color: #008000;">right分支结束</span></pre>
</div>
<p>&nbsp;</p>
<h3><span style="font-size: 14pt;"><strong>声明变量</strong></span></h3>
<p>声明变量也就是：</p>
<div class="cnblogs_code">
<pre><span style="color: #0000ff;">var</span> a = "hello world!";</pre>
</div>
<p>可被其它函数使用。那么我们的实现是：</p>
<div class="cnblogs_code">
<pre>Thread().    <span style="color: #008000;">//</span><span style="color: #008000;">得到线程</span>
define("hello world!").    <span style="color: #008000;">//</span><span style="color: #008000;">将回调函数第一个参数设为hello world!</span>
then(<span style="color: #0000ff;">function</span>(a){alert(a);});    <span style="color: #008000;">//</span><span style="color: #008000;">获取变量a，alert出来</span></pre>
</div>
<p>&nbsp;</p>
<h3><span style="font-size: 14pt;"><strong>顺序执行实现方案</strong></span></h3>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="http://images.cnitblog.com/blog/372204/201301/24135349-c5807eeec1594b74956f665509bdc800.jpg" alt="" />Thread实际上是一个打包函数Fn队列。</p>
<p>所谓打包函数就是将回调函数打包后产生的新的函数，举个例子：</p>
<div class="cnblogs_code">
<pre><span style="color: #000000;">function package(callback){
    return function(){
        callback();
        // 干其他事情
    }
}</span></pre>
</div>
<blockquote>
<p>这样我们就将callback函数打包起来了。</p>
</blockquote>
<p>Thread提供一个fire方法来触发线程取出一个打包函数然后执行，打包函数执行以后回调Thread的fire方法。</p>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="http://images.cnitblog.com/blog/372204/201301/24140139-e40217787b4642e4b3f9877b8724394c.jpg" alt="" /></p>
<p>那么我们就可以顺序执行函数了。</p>
<p>现在只要打包的时候设置setTimeout执行，则这个线程就能实现wait方法了。</p>
<p>&nbsp;</p>
<h3><span style="font-size: 14pt;"><strong>循环执行实现方案</strong></span></h3>
<p>循环Loop是一个Thread的变形，只不过在执行里面的打包函数的时候使用另外一种方案，通过添加一个指针取出，执行完后触发Loop继续，移动指针取出下一个打包函数。</p>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="http://images.cnitblog.com/blog/372204/201301/24140721-da33eb8f703740b1a88f55c28888c57f.jpg" alt="" /></p>
<p>&nbsp;</p>
<h3><span style="font-size: 14pt;"><strong>分支执行实现方案</strong></span></h3>
<p>分支Right和Left也是Thread的一种变形，开启分支的时候，主Thread会创建两个分支Right线程和Left线程，打包一个触发分支Thread的函数推入队列，然后当执行到该函数的时候判断触发哪个分支执行。</p>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="http://images.cnitblog.com/blog/372204/201301/24141233-91c1f833a4fa4fee9a9adc40f1831acc.jpg" alt="" /></p>
<p>其中一个队列执行结束后回调主Thread，通知进行下一步。&nbsp;</p>
<p>&nbsp;</p>
<h3><span style="font-size: 14pt;"><strong>例子</strong></span></h3>
<p>由于该方案和wind-asycn非常相似，所以我们拿wind.js中的clock例子进行改造看看其中的差别吧。</p>
<p>wind.js中的例子：</p>
<div class="cnblogs_Highlighter">
<pre class="brush:javascript;collapse:true;;gutter:true;">&lt;!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Clock - Wind.js Sample&lt;/title&gt;
    &lt;meta http-equiv="X-UA-Compatible" content="IE=9" /&gt;    
    
    &lt;script src="http://www.cnblogs.com/../src/wind-core.js"&gt;&lt;/script&gt;
    &lt;script src="http://www.cnblogs.com/../src/wind-compiler.js"&gt;&lt;/script&gt;
    &lt;script src="http://www.cnblogs.com/../src/wind-builderbase.js"&gt;&lt;/script&gt;
    &lt;script src="http://www.cnblogs.com/../src/wind-async.js"&gt;&lt;/script&gt;

    &lt;script&gt;
        var drawHand = function(value, length) {
            ctx.beginPath();
            
            var angle = Math.PI * 2 * value / 60;
            var x = Math.sin(angle) * length;
            var y = Math.cos(angle) * length;
            
            ctx.moveTo(100, 100);
            ctx.lineTo(100 + x, 100 - y);
            ctx.stroke();
        }
    
        var drawClock = function(time) {
            if (!ctx) {
                var h = time.getHours();
                var m = time.getMinutes();
                var s = time.getSeconds();
                
                var text = 
                    ((h &gt;= 10) ? h : "0" + h) + ":" +
                    ((h &gt;= 10) ? m : "0" + m) + ":" +
                    ((h &gt;= 10) ? s : "0" + s);
                
                document.getElementById("clockText").innerHTML = text;
                return;
            }
        
            ctx.clearRect(0, 0, 200, 200);
            
            ctx.beginPath();
            ctx.arc(100, 100, 90, 0, Math.PI * 2, false);
            for (var i = 0; i &lt; 60; i += 5) {
                var angle = Math.PI * 2 * i / 60;
                var x = Math.sin(angle);
                var y = Math.cos(angle);
                ctx.moveTo(100 + x * 85, 100 - y * 85);
                ctx.lineTo(100 + x * 90, 100 - y * 90);
            }
            ctx.stroke();
            
            drawHand(time.getSeconds(), 80);
            drawHand(time.getMinutes() + time.getSeconds() * 1.0 / 60, 60);
            drawHand(time.getHours() % 12 * 5 + time.getMinutes() * 1.0 / 12, 40);
        }
    
        var drawClockAsync = eval(Wind.compile("async", function(interval) {
            while (true) {
                drawClock(new Date());
                $await(Wind.Async.sleep(interval));
            }
        }));
    &lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;canvas id="clockCanvas" height="200" width="200"&gt;
        &lt;div id="clockText" style="font-size:20pt;"&gt;&lt;/div&gt;
    &lt;/canvas&gt;
    &lt;script&gt;
        var canvas = document.getElementById("clockCanvas");
        var ctx = canvas.getContext ? canvas.getContext("2d") : null;
        drawClockAsync(1000).start();
    &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
</pre>
</div>
<p>　　</p>
<p>我的例子：</p>
<div class="cnblogs_Highlighter">
<pre class="brush:javascript;collapse:true;;gutter:true;">&lt;!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Clock - asThread.js Sample&lt;/title&gt;
    &lt;meta http-equiv="X-UA-Compatible" content="IE=9" /&gt;    
    &lt;!-- 例子修改自wind.js --&gt;
    &lt;script src="asThread.js"&gt;&lt;/script&gt;

    &lt;script&gt;
        var drawHand = function(value, length) {
            ctx.beginPath();
            
            var angle = Math.PI * 2 * value / 60;
            var x = Math.sin(angle) * length;
            var y = Math.cos(angle) * length;
            
            ctx.moveTo(100, 100);
            ctx.lineTo(100 + x, 100 - y);
            ctx.stroke();
        }
    
        var drawClock = function() {
            var time = new Date()
            if (!ctx) {
                var h = time.getHours();
                var m = time.getMinutes();
                var s = time.getSeconds();
                
                var text = 
                    ((h &gt;= 10) ? h : "0" + h) + ":" +
                    ((h &gt;= 10) ? m : "0" + m) + ":" +
                    ((h &gt;= 10) ? s : "0" + s);
                
                document.getElementById("clockText").innerHTML = text;
                return;
            }
        
            ctx.clearRect(0, 0, 200, 200);
            
            ctx.beginPath();
            ctx.arc(100, 100, 90, 0, Math.PI * 2, false);
            for (var i = 0; i &lt; 60; i += 5) {
                var angle = Math.PI * 2 * i / 60;
                var x = Math.sin(angle);
                var y = Math.cos(angle);
                ctx.moveTo(100 + x * 85, 100 - y * 85);
                ctx.lineTo(100 + x * 90, 100 - y * 90);
            }
            ctx.stroke();
            
            drawHand(time.getSeconds(), 80);
            drawHand(time.getMinutes() + time.getSeconds() * 1.0 / 60, 60);
            drawHand(time.getHours() % 12 * 5 + time.getMinutes() * 1.0 / 12, 40);
            
        }
        
        Thread().    // 使用主线程线程
        loop(-1).    // 负数表示循环无限多次，如果是正数n，则表示n次循环
            then(drawClock). // 循环中运行drawClock
            wait(1000).    // 然后等待1000ms
        loopEnd();    // 循环结束
        // 线程定义结束
    &lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;canvas id="clockCanvas" height="200" width="200"&gt;
        &lt;div id="clockText" style="font-size:20pt;"&gt;&lt;/div&gt;
    &lt;/canvas&gt;
    &lt;script&gt;
        var canvas = document.getElementById("clockCanvas");
        var ctx = canvas.getContext ? canvas.getContext("2d") : null;
        Thread().run();    // 运行线程
    &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
</pre>
</div>
<p>　　</p>
<h3><span style="font-size: 14pt;"><strong>Something more?</strong></span></h3>
<ul>
<li>将事件当成分支处理</li>
</ul>
<blockquote>
<p>我们提供了on方法将事件转成分支来执行。</p>
<p>举个例子页面有个按钮&ldquo;点我&rdquo;，但是我们希望打开页面5秒内单击没有效，5秒后显示&ldquo;请点击按钮&rdquo;后，单击才会出现&ldquo;你成功点击了&rdquo;。</p>
<p>使用on分支是这样的：</p>
<div class="cnblogs_code">
<pre><span style="color: #0000ff;">&lt;!</span><span style="color: #ff00ff;">DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;</span><span style="color: #800000;">html</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;</span><span style="color: #800000;">head</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">title</span><span style="color: #0000ff;">&gt;</span>on - asThread.js Sample<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">title</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">meta </span><span style="color: #ff0000;">http-equiv</span><span style="color: #0000ff;">="X-UA-Compatible"</span><span style="color: #ff0000;"> content</span><span style="color: #0000ff;">="IE=9"</span> <span style="color: #0000ff;">/&gt;</span>    
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">src</span><span style="color: #0000ff;">="asThread.js"</span><span style="color: #0000ff;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">head</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;</span><span style="color: #800000;">body</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">button </span><span style="color: #ff0000;">id </span><span style="color: #0000ff;">= "b"</span><span style="color: #0000ff;">&gt;</span>点我<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">button</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
        <span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> ele </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> document.getElementById(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">b</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">);
    
        Thread().    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 获得线程</span>
<span style="background-color: #f5f5f5; color: #000000;">        then(</span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;">(){alert(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">请点击按钮</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">)}, </span><span style="background-color: #f5f5f5; color: #000000;">5000</span><span style="background-color: #f5f5f5; color: #000000;">).    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;">然后等5秒显示"请点击按钮"</span>
<span style="background-color: #f5f5f5; color: #000000;">        on(ele, </span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">click</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">).    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 事件分支On开始，如果ele触发了click事件</span>
<span style="background-color: #f5f5f5; color: #000000;">            then(</span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;">(){alert(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">你成功点击了</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">)}).    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;">那么执行你成功点击了</span>
<span style="background-color: #f5f5f5; color: #000000;">        onEnd().    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 事件分支On结束</span>
<span style="background-color: #f5f5f5; color: #000000;">        then(</span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;">(){alert(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">都说可以的了</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">)}).    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 然后弹出"都说可以的了"</span>
<span style="background-color: #f5f5f5; color: #000000;">        run();    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;">启动线程</span>
    <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">body</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">html</span><span style="color: #0000ff;">&gt;</span></pre>
</div>
<p>自定义事件也可以哦，只要在.on时候传进去注册监听函数，和删除监听函数就行了。比如：</p>
<div class="cnblogs_code">
<pre><span style="color: #0000ff;">function</span><span style="color: #000000;"> addEvent(__elem, __type, __handler){
    </span><span style="color: #008000;">//</span><span style="color: #008000;">添加监听</span>
<span style="color: #000000;">}

</span><span style="color: #0000ff;">function</span><span style="color: #000000;"> removeEvent(__elem, __type, __handler){
    </span><span style="color: #008000;">//</span><span style="color: #008000;">删除监听</span>
<span style="color: #000000;">}

Thread().
on(ele, </span>"success"<span style="color: #000000;">, addEvent, removeEvent).
    then(</span><span style="color: #0000ff;">function</span>(){alert("成功！"<span style="color: #000000;">)}).
onEnd().
run();</span></pre>
</div>
</blockquote>
<ul>
<li>开辟多个线程</li>
</ul>
<blockquote>
<p>一个线程不够用？只要输入名字就能开辟或者得到线程了。</p>
<p>系统会自动初始化一个主线程，当不传参数时就直接返回主线程：</p>
<div class="cnblogs_code">
<pre>Thread() <span style="color: #008000;">//</span><span style="color: #008000;">得到主线程</span></pre>
</div>
<p>但如果主线程正在用想开辟一个线程时，只要给个名字就行，比如：</p>
<div class="cnblogs_code">
<pre>Thread("hello")    <span style="color: #008000;">//</span><span style="color: #008000;">得到名字是hello的线程</span></pre>
</div>
<p>那么下次再想用该线程时只要输入相同的名字就行了：</p>
<div class="cnblogs_code">
<pre>Thread("hello")    <span style="color: #008000;">//</span><span style="color: #008000;">得到hello线程</span></pre>
</div>
<p>默认只最多只提供10个线程，所以用完记得删掉：</p>
<div class="cnblogs_code">
<pre>Thread("hello").del();</pre>
</div>
</blockquote>
<ul>
<li>setImmediate</li>
</ul>
<blockquote>
<p>IE10已经提供了setImmediate方法，而其他现代浏览器也可以模拟该方法，其原理是推倒线程末端，使得浏览器画面能渲染，得到比setTimeout(0)更快的响应。</p>
<p>我们通过接口.imm来提供这一功能。比如：</p>
<div class="cnblogs_code">
<pre><span style="color: #000000;">Thread().
imm(</span><span style="color: #0000ff;">function</span>(){alert("hello world"<span style="color: #000000;">)}).
run();</span></pre>
</div>
<p>这方法和.then(fn)不太一样，.then(fn)是可能阻塞当前浏览器线程的，当.imm(fn)是将处理推到浏览器引擎列队末端，排到队了在运行。</p>
<p>当然对于老版IE，只能用setTimeout(0)替代了。</p>
</blockquote>
<ul>
<li>分支参数可以是函数</li>
</ul>
<blockquote>
<p>分支Right传的参数如果只是布尔值肯定很不爽，因为这意味着分支是静态的，在初始化时候就决定了，但我们希望分支能在执行到的时候再判断是走Right还是Left，所以我们提供了传参可以是函数（但是函数返回值需要是布尔值，否则&hellip;&hellip;╮(╯▽╰)╭也会转成布尔值的&hellip;&hellip;哈哈）。比如：</p>
<div class="cnblogs_code">
<pre>fucntion foo(<span style="color: #0000ff;">boolean</span><span style="color: #000000;">){
    </span><span style="color: #0000ff;">return</span> !<span style="color: #0000ff;">boolean</span><span style="color: #000000;">;
}

Thread().
define(</span><span style="color: #0000ff;">true</span><span style="color: #000000;">).
right(foo).
    then(</span><span style="color: #0000ff;">function</span>(){<span style="color: #008000;">/*</span><span style="color: #008000;">这里不会运行到*/}).</span>
<span style="color: #000000;">rightEnd().
run();</span></pre>
</div>
</blockquote>
<h3><span style="font-size: 14pt;"><strong>Enjoy yourself!!</strong></span></h3>
<p>&nbsp;</p>

## License
All code inside is licensed under MIT license.