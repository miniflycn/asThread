# asThread: Javascript线程模拟器

主页: https://github.com/miniflycn/asThread


## 目标
进行Javascript模拟线程实验。

## 实现方法
### Thread(name)	获取名字为name的线程，没有则为默认线程

.then(fun, delay)	延迟delay执行fun

.wait(delay)	延迟delay执行下个动作

.define(value1, value2, value3 ……)	给回调函数设置参数

.imm(fun)		setImmediately

.run()			启动线程

.loop(n)		得到一个Loop对象，用于循环，n为正循环n次，为负永远循环除非调用Loop.breakOut()

.right(boolen)	得到分支Right，boolen为布尔值或者返回布尔值的函数，为true则执行Right分支，否则执行Left分支



### Loop extend Thread

Loop.define(value1, value2, value3 ……)	给Loop内的回调函数设置参数，参数从第二个位置开始，第一个永远是循环次数i

Loop.then(fun, delay)	同.then(fun, delay)

Loop.wait(delay)		同.wait(delay)

Loop.imm(fun)			同.imm(fun)

Loop.loopEnd()			Loop结尾，返回原线程Thread



### Right extend Thread

Right.define(value1, value2, value3 ……)	同.define(value1, value2, value3 ……)

Right.then(fun, delay)	同.then(fun, delay)

Right.wait(delay)		同.wait(delay)

Right.imm(fun)			同.imm(fun)

Right.rightEnd()		Right分支结束，返回原线程Thread

Right.left()			得到分支Left



### Left extend Thread

Left.define(value1, value2, value3 ……)	同.define(value1, value2, value3 ……)

Left.then(fun, delay)	同.then(fun, delay)

Left.wait(delay)		同.wait(delay)

Left.imm(fun)			同.imm(fun)

Left.leftEnd()			Left分支结束，返回原线程Thread



## License
All code inside is licensed under MIT license.