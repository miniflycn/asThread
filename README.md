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
<p>我们知道链式操作是可以很好的表征运行顺序的，这对于通常基于回调函数或者基于事件监听的异步模型中，代码的执行顺序不清晰。</p>
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
<div class="cnblogs_code">
<pre><span style="color: #0000ff;">&lt;!</span><span style="color: #ff00ff;">DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;</span><span style="color: #800000;">html</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;</span><span style="color: #800000;">head</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">title</span><span style="color: #0000ff;">&gt;</span>Clock - Wind.js Sample<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">title</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">meta </span><span style="color: #ff0000;">http-equiv</span><span style="color: #0000ff;">="X-UA-Compatible"</span><span style="color: #ff0000;"> content</span><span style="color: #0000ff;">="IE=9"</span> <span style="color: #0000ff;">/&gt;</span>    
    
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">src</span><span style="color: #0000ff;">="http://www.cnblogs.com/../src/wind-core.js"</span><span style="color: #0000ff;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">src</span><span style="color: #0000ff;">="http://www.cnblogs.com/../src/wind-compiler.js"</span><span style="color: #0000ff;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">src</span><span style="color: #0000ff;">="http://www.cnblogs.com/../src/wind-builderbase.js"</span><span style="color: #0000ff;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">src</span><span style="color: #0000ff;">="http://www.cnblogs.com/../src/wind-async.js"</span><span style="color: #0000ff;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>

    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
        <span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> drawHand </span><span style="background-color: #f5f5f5; color: #000000;">=</span> <span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;">(value, length) {
            ctx.beginPath();
            
            </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> angle </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.PI </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">2</span> <span style="background-color: #f5f5f5; color: #000000;">*</span><span style="background-color: #f5f5f5; color: #000000;"> value </span><span style="background-color: #f5f5f5; color: #000000;">/</span> <span style="background-color: #f5f5f5; color: #000000;">60</span><span style="background-color: #f5f5f5; color: #000000;">;
            </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> x </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.sin(angle) </span><span style="background-color: #f5f5f5; color: #000000;">*</span><span style="background-color: #f5f5f5; color: #000000;"> length;
            </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> y </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.cos(angle) </span><span style="background-color: #f5f5f5; color: #000000;">*</span><span style="background-color: #f5f5f5; color: #000000;"> length;
            
            ctx.moveTo(</span><span style="background-color: #f5f5f5; color: #000000;">100</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">100</span><span style="background-color: #f5f5f5; color: #000000;">);
            ctx.lineTo(</span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> x, </span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">-</span><span style="background-color: #f5f5f5; color: #000000;"> y);
            ctx.stroke();
        }
    
        </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> drawClock </span><span style="background-color: #f5f5f5; color: #000000;">=</span> <span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;">(time) {
            </span><span style="background-color: #f5f5f5; color: #0000ff;">if</span><span style="background-color: #f5f5f5; color: #000000;"> (</span><span style="background-color: #f5f5f5; color: #000000;">!</span><span style="background-color: #f5f5f5; color: #000000;">ctx) {
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> h </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> time.getHours();
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> m </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> time.getMinutes();
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> s </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> time.getSeconds();
                
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> text </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> 
                    ((h </span><span style="background-color: #f5f5f5; color: #000000;">&gt;=</span> <span style="background-color: #f5f5f5; color: #000000;">10</span><span style="background-color: #f5f5f5; color: #000000;">) </span><span style="background-color: #f5f5f5; color: #000000;">?</span><span style="background-color: #f5f5f5; color: #000000;"> h : </span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">"</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> h) </span><span style="background-color: #f5f5f5; color: #000000;">+</span> <span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">:</span><span style="background-color: #f5f5f5; color: #000000;">"</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;">
                    ((h </span><span style="background-color: #f5f5f5; color: #000000;">&gt;=</span> <span style="background-color: #f5f5f5; color: #000000;">10</span><span style="background-color: #f5f5f5; color: #000000;">) </span><span style="background-color: #f5f5f5; color: #000000;">?</span><span style="background-color: #f5f5f5; color: #000000;"> m : </span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">"</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> m) </span><span style="background-color: #f5f5f5; color: #000000;">+</span> <span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">:</span><span style="background-color: #f5f5f5; color: #000000;">"</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;">
                    ((h </span><span style="background-color: #f5f5f5; color: #000000;">&gt;=</span> <span style="background-color: #f5f5f5; color: #000000;">10</span><span style="background-color: #f5f5f5; color: #000000;">) </span><span style="background-color: #f5f5f5; color: #000000;">?</span><span style="background-color: #f5f5f5; color: #000000;"> s : </span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">"</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> s);
                
                document.getElementById(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">clockText</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">).innerHTML </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> text;
                </span><span style="background-color: #f5f5f5; color: #0000ff;">return</span><span style="background-color: #f5f5f5; color: #000000;">;
            }
        
            ctx.clearRect(</span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">200</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">200</span><span style="background-color: #f5f5f5; color: #000000;">);
            
            ctx.beginPath();
            ctx.arc(</span><span style="background-color: #f5f5f5; color: #000000;">100</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">100</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">90</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">, Math.PI </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">2</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #0000ff;">false</span><span style="background-color: #f5f5f5; color: #000000;">);
            </span><span style="background-color: #f5f5f5; color: #0000ff;">for</span><span style="background-color: #f5f5f5; color: #000000;"> (</span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> i </span><span style="background-color: #f5f5f5; color: #000000;">=</span> <span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">; i </span><span style="background-color: #f5f5f5; color: #000000;">&lt;</span> <span style="background-color: #f5f5f5; color: #000000;">60</span><span style="background-color: #f5f5f5; color: #000000;">; i </span><span style="background-color: #f5f5f5; color: #000000;">+=</span> <span style="background-color: #f5f5f5; color: #000000;">5</span><span style="background-color: #f5f5f5; color: #000000;">) {
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> angle </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.PI </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">2</span> <span style="background-color: #f5f5f5; color: #000000;">*</span><span style="background-color: #f5f5f5; color: #000000;"> i </span><span style="background-color: #f5f5f5; color: #000000;">/</span> <span style="background-color: #f5f5f5; color: #000000;">60</span><span style="background-color: #f5f5f5; color: #000000;">;
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> x </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.sin(angle);
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> y </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.cos(angle);
                ctx.moveTo(</span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> x </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">85</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">-</span><span style="background-color: #f5f5f5; color: #000000;"> y </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">85</span><span style="background-color: #f5f5f5; color: #000000;">);
                ctx.lineTo(</span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> x </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">90</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">-</span><span style="background-color: #f5f5f5; color: #000000;"> y </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">90</span><span style="background-color: #f5f5f5; color: #000000;">);
            }
            ctx.stroke();
            
            drawHand(time.getSeconds(), </span><span style="background-color: #f5f5f5; color: #000000;">80</span><span style="background-color: #f5f5f5; color: #000000;">);
            drawHand(time.getMinutes() </span><span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> time.getSeconds() </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">1.0</span> <span style="background-color: #f5f5f5; color: #000000;">/</span> <span style="background-color: #f5f5f5; color: #000000;">60</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">60</span><span style="background-color: #f5f5f5; color: #000000;">);
            drawHand(time.getHours() </span><span style="background-color: #f5f5f5; color: #000000;">%</span> <span style="background-color: #f5f5f5; color: #000000;">12</span> <span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">5</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> time.getMinutes() </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">1.0</span> <span style="background-color: #f5f5f5; color: #000000;">/</span> <span style="background-color: #f5f5f5; color: #000000;">12</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">40</span><span style="background-color: #f5f5f5; color: #000000;">);
        }
    
        </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> drawClockAsync </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> eval(Wind.compile(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">async</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;">(interval) {
            </span><span style="background-color: #f5f5f5; color: #0000ff;">while</span><span style="background-color: #f5f5f5; color: #000000;"> (</span><span style="background-color: #f5f5f5; color: #0000ff;">true</span><span style="background-color: #f5f5f5; color: #000000;">) {
                drawClock(</span><span style="background-color: #f5f5f5; color: #0000ff;">new</span><span style="background-color: #f5f5f5; color: #000000;"> Date());
                $await(Wind.Async.sleep(interval));
            }
        }));
    </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">head</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;</span><span style="color: #800000;">body</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">canvas </span><span style="color: #ff0000;">id</span><span style="color: #0000ff;">="clockCanvas"</span><span style="color: #ff0000;"> height</span><span style="color: #0000ff;">="200"</span><span style="color: #ff0000;"> width</span><span style="color: #0000ff;">="200"</span><span style="color: #0000ff;">&gt;</span>
        <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">div </span><span style="color: #ff0000;">id</span><span style="color: #0000ff;">="clockText"</span><span style="color: #ff0000;"> style</span><span style="color: #0000ff;">="font-size:20pt;"</span><span style="color: #0000ff;">&gt;&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">canvas</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
        <span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> canvas </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> document.getElementById(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">clockCanvas</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">);
        </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> ctx </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> canvas.getContext </span><span style="background-color: #f5f5f5; color: #000000;">?</span><span style="background-color: #f5f5f5; color: #000000;"> canvas.getContext(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">2d</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">) : </span><span style="background-color: #f5f5f5; color: #0000ff;">null</span><span style="background-color: #f5f5f5; color: #000000;">;
        drawClockAsync(</span><span style="background-color: #f5f5f5; color: #000000;">1000</span><span style="background-color: #f5f5f5; color: #000000;">).start();
    </span><span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">body</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">html</span><span style="color: #0000ff;">&gt;</span></pre>
</div>
<p>我的例子：</p>
<div class="cnblogs_code">
<pre><span style="color: #0000ff;">&lt;!</span><span style="color: #ff00ff;">DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;</span><span style="color: #800000;">html</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;</span><span style="color: #800000;">head</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">title</span><span style="color: #0000ff;">&gt;</span>Clock - asThread.js Sample<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">title</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">meta </span><span style="color: #ff0000;">http-equiv</span><span style="color: #0000ff;">="X-UA-Compatible"</span><span style="color: #ff0000;"> content</span><span style="color: #0000ff;">="IE=9"</span> <span style="color: #0000ff;">/&gt;</span>    
    <span style="color: #008000;">&lt;!--</span><span style="color: #008000;"> 例子修改自wind.js </span><span style="color: #008000;">--&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script </span><span style="color: #ff0000;">src</span><span style="color: #0000ff;">="asThread.js"</span><span style="color: #0000ff;">&gt;&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>

    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
        <span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> drawHand </span><span style="background-color: #f5f5f5; color: #000000;">=</span> <span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;">(value, length) {
            ctx.beginPath();
            
            </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> angle </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.PI </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">2</span> <span style="background-color: #f5f5f5; color: #000000;">*</span><span style="background-color: #f5f5f5; color: #000000;"> value </span><span style="background-color: #f5f5f5; color: #000000;">/</span> <span style="background-color: #f5f5f5; color: #000000;">60</span><span style="background-color: #f5f5f5; color: #000000;">;
            </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> x </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.sin(angle) </span><span style="background-color: #f5f5f5; color: #000000;">*</span><span style="background-color: #f5f5f5; color: #000000;"> length;
            </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> y </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.cos(angle) </span><span style="background-color: #f5f5f5; color: #000000;">*</span><span style="background-color: #f5f5f5; color: #000000;"> length;
            
            ctx.moveTo(</span><span style="background-color: #f5f5f5; color: #000000;">100</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">100</span><span style="background-color: #f5f5f5; color: #000000;">);
            ctx.lineTo(</span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> x, </span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">-</span><span style="background-color: #f5f5f5; color: #000000;"> y);
            ctx.stroke();
        }
    
        </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> drawClock </span><span style="background-color: #f5f5f5; color: #000000;">=</span> <span style="background-color: #f5f5f5; color: #0000ff;">function</span><span style="background-color: #f5f5f5; color: #000000;">() {
            </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> time </span><span style="background-color: #f5f5f5; color: #000000;">=</span> <span style="background-color: #f5f5f5; color: #0000ff;">new</span><span style="background-color: #f5f5f5; color: #000000;"> Date()
            </span><span style="background-color: #f5f5f5; color: #0000ff;">if</span><span style="background-color: #f5f5f5; color: #000000;"> (</span><span style="background-color: #f5f5f5; color: #000000;">!</span><span style="background-color: #f5f5f5; color: #000000;">ctx) {
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> h </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> time.getHours();
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> m </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> time.getMinutes();
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> s </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> time.getSeconds();
                
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> text </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> 
                    ((h </span><span style="background-color: #f5f5f5; color: #000000;">&gt;=</span> <span style="background-color: #f5f5f5; color: #000000;">10</span><span style="background-color: #f5f5f5; color: #000000;">) </span><span style="background-color: #f5f5f5; color: #000000;">?</span><span style="background-color: #f5f5f5; color: #000000;"> h : </span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">"</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> h) </span><span style="background-color: #f5f5f5; color: #000000;">+</span> <span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">:</span><span style="background-color: #f5f5f5; color: #000000;">"</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;">
                    ((h </span><span style="background-color: #f5f5f5; color: #000000;">&gt;=</span> <span style="background-color: #f5f5f5; color: #000000;">10</span><span style="background-color: #f5f5f5; color: #000000;">) </span><span style="background-color: #f5f5f5; color: #000000;">?</span><span style="background-color: #f5f5f5; color: #000000;"> m : </span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">"</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> m) </span><span style="background-color: #f5f5f5; color: #000000;">+</span> <span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">:</span><span style="background-color: #f5f5f5; color: #000000;">"</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;">
                    ((h </span><span style="background-color: #f5f5f5; color: #000000;">&gt;=</span> <span style="background-color: #f5f5f5; color: #000000;">10</span><span style="background-color: #f5f5f5; color: #000000;">) </span><span style="background-color: #f5f5f5; color: #000000;">?</span><span style="background-color: #f5f5f5; color: #000000;"> s : </span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">"</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> s);
                
                document.getElementById(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">clockText</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">).innerHTML </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> text;
                </span><span style="background-color: #f5f5f5; color: #0000ff;">return</span><span style="background-color: #f5f5f5; color: #000000;">;
            }
        
            ctx.clearRect(</span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">200</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">200</span><span style="background-color: #f5f5f5; color: #000000;">);
            
            ctx.beginPath();
            ctx.arc(</span><span style="background-color: #f5f5f5; color: #000000;">100</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">100</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">90</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">, Math.PI </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">2</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #0000ff;">false</span><span style="background-color: #f5f5f5; color: #000000;">);
            </span><span style="background-color: #f5f5f5; color: #0000ff;">for</span><span style="background-color: #f5f5f5; color: #000000;"> (</span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> i </span><span style="background-color: #f5f5f5; color: #000000;">=</span> <span style="background-color: #f5f5f5; color: #000000;">0</span><span style="background-color: #f5f5f5; color: #000000;">; i </span><span style="background-color: #f5f5f5; color: #000000;">&lt;</span> <span style="background-color: #f5f5f5; color: #000000;">60</span><span style="background-color: #f5f5f5; color: #000000;">; i </span><span style="background-color: #f5f5f5; color: #000000;">+=</span> <span style="background-color: #f5f5f5; color: #000000;">5</span><span style="background-color: #f5f5f5; color: #000000;">) {
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> angle </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.PI </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">2</span> <span style="background-color: #f5f5f5; color: #000000;">*</span><span style="background-color: #f5f5f5; color: #000000;"> i </span><span style="background-color: #f5f5f5; color: #000000;">/</span> <span style="background-color: #f5f5f5; color: #000000;">60</span><span style="background-color: #f5f5f5; color: #000000;">;
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> x </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.sin(angle);
                </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> y </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> Math.cos(angle);
                ctx.moveTo(</span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> x </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">85</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">-</span><span style="background-color: #f5f5f5; color: #000000;"> y </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">85</span><span style="background-color: #f5f5f5; color: #000000;">);
                ctx.lineTo(</span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> x </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">90</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">100</span> <span style="background-color: #f5f5f5; color: #000000;">-</span><span style="background-color: #f5f5f5; color: #000000;"> y </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">90</span><span style="background-color: #f5f5f5; color: #000000;">);
            }
            ctx.stroke();
            
            drawHand(time.getSeconds(), </span><span style="background-color: #f5f5f5; color: #000000;">80</span><span style="background-color: #f5f5f5; color: #000000;">);
            drawHand(time.getMinutes() </span><span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> time.getSeconds() </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">1.0</span> <span style="background-color: #f5f5f5; color: #000000;">/</span> <span style="background-color: #f5f5f5; color: #000000;">60</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">60</span><span style="background-color: #f5f5f5; color: #000000;">);
            drawHand(time.getHours() </span><span style="background-color: #f5f5f5; color: #000000;">%</span> <span style="background-color: #f5f5f5; color: #000000;">12</span> <span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">5</span> <span style="background-color: #f5f5f5; color: #000000;">+</span><span style="background-color: #f5f5f5; color: #000000;"> time.getMinutes() </span><span style="background-color: #f5f5f5; color: #000000;">*</span> <span style="background-color: #f5f5f5; color: #000000;">1.0</span> <span style="background-color: #f5f5f5; color: #000000;">/</span> <span style="background-color: #f5f5f5; color: #000000;">12</span><span style="background-color: #f5f5f5; color: #000000;">, </span><span style="background-color: #f5f5f5; color: #000000;">40</span><span style="background-color: #f5f5f5; color: #000000;">);
            
        }
        
        Thread().    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 使用主线程线程</span>
<span style="background-color: #f5f5f5; color: #000000;">        loop(</span><span style="background-color: #f5f5f5; color: #000000;">-</span><span style="background-color: #f5f5f5; color: #000000;">1</span><span style="background-color: #f5f5f5; color: #000000;">).    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 负数表示循环无限多次，如果是正数n，则表示n次循环</span>
<span style="background-color: #f5f5f5; color: #000000;">        then(drawClock). </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 循环中运行drawClock</span>
<span style="background-color: #f5f5f5; color: #000000;">        wait(</span><span style="background-color: #f5f5f5; color: #000000;">1000</span><span style="background-color: #f5f5f5; color: #000000;">).    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 然后等待1000ms</span>
<span style="background-color: #f5f5f5; color: #000000;">        loopEnd();    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 循环结束</span>
        <span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 线程定义结束</span>
    <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">head</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;</span><span style="color: #800000;">body</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">canvas </span><span style="color: #ff0000;">id</span><span style="color: #0000ff;">="clockCanvas"</span><span style="color: #ff0000;"> height</span><span style="color: #0000ff;">="200"</span><span style="color: #ff0000;"> width</span><span style="color: #0000ff;">="200"</span><span style="color: #0000ff;">&gt;</span>
        <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">div </span><span style="color: #ff0000;">id</span><span style="color: #0000ff;">="clockText"</span><span style="color: #ff0000;"> style</span><span style="color: #0000ff;">="font-size:20pt;"</span><span style="color: #0000ff;">&gt;&lt;/</span><span style="color: #800000;">div</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">canvas</span><span style="color: #0000ff;">&gt;</span>
    <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
        <span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> canvas </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> document.getElementById(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">clockCanvas</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">);
        </span><span style="background-color: #f5f5f5; color: #0000ff;">var</span><span style="background-color: #f5f5f5; color: #000000;"> ctx </span><span style="background-color: #f5f5f5; color: #000000;">=</span><span style="background-color: #f5f5f5; color: #000000;"> canvas.getContext </span><span style="background-color: #f5f5f5; color: #000000;">?</span><span style="background-color: #f5f5f5; color: #000000;"> canvas.getContext(</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">2d</span><span style="background-color: #f5f5f5; color: #000000;">"</span><span style="background-color: #f5f5f5; color: #000000;">) : </span><span style="background-color: #f5f5f5; color: #0000ff;">null</span><span style="background-color: #f5f5f5; color: #000000;">;
        Thread().run();    </span><span style="background-color: #f5f5f5; color: #008000;">//</span><span style="background-color: #f5f5f5; color: #008000;"> 运行线程</span>
    <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">script</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">body</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">html</span><span style="color: #0000ff;">&gt;</span></pre>
</div>

## License
All code inside is licensed under MIT license.