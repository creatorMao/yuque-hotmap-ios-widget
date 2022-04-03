class Im3xWidget {
    /**
    * 初始化
    * @param arg 外部传递过来的参数
    */
    constructor(arg) {
        this.arg = arg
        this.widgetSize = config.widgetFamily
    }

    //渲染组件
    async render() {
        if (this.widgetSize === 'small') {
            return await this.renderSmall()
        } else if (this.widgetSize === 'large') {
            return await this.renderLarge()
        } else {
            return await this.renderMedium()
        }
    }

    async renderUI() {
        let w = new ListWidget()
        let weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

        //标题
        let header = w.addStack()
        //         let icon = header.addImage(await this.getImage('https://gw.alipayobdayects.com/mdn/prod_resou/afts/img/A*OwZWQ68zSTMAAAAAAAAAAABkARQnAQ'))
        //         icon.imageSize = new Size(40, 16)
        let title = header.addText("｜创作指数")

        title.font = Font.systemFont(10)
        header.centerAlignContent()
        w.addSpacer(4)

        //创作指数
        let data = await this.getData()
        for (let day = 0; day < weekDay.length; day++) {
            let row = w.addStack()

            let ww = 1
            let h = 1

            //设置星期几
            let stock = row.addStack()
            stock.size = new Size(20, 10)
            let title = stock.addText(weekDay[day])
            title.textOpacity = 0
            title.font = Font.systemFont(7)
            stock.addSpacer(4)
            if (day % 2 == 1 && day != 0) {
                title.textOpacity = 1
            }

            //设置创作指数
            for (let week = 0; i < 15; week++) {
                let context = new DrawContext()
                context.size = new Size(ww, h)
                context.opaque = false
                context.respectScreenScale = false

                let level=data.data[day*week]["level"];
                let hotColor="";
                switch(level)
                {
                    case "-1":
                        hotColor="#ffffff";
                        break;
                    case "0":
                        hotColor="#f5f5f5";
                        break;
                    case "1":
                        hotColor="#e1f2e2";
                        break;
                    case "2":
                        hotColor="#bee8c8";
                        break;
                    case "3":
                        hotColor="#6bb579";
                        break;
                    case "4":
                        hotColor="#397549";
                        break;
                    case "5":
                        hotColor="#21472c";
                        break;
                }

                context.setFillColor(new Color(hotColor, 1))
                let path = new Path()
                path.addRoundedRect(new Rect(0, 0, ww, h), 0, 0)
                context.addPath(path)
                context.fillPath()

                context.setFillColor(new Color("#373737", 1))
                row.addImage(context.getImage())
                row.addSpacer(3)
            }
            w.addSpacer(3)
        }
        return w
    }
    //渲染小尺寸组件
    async renderSmall() {
        return this.renderUI()
    }
    //渲染中尺寸组件
    async renderMedium() {
        return this.renderUI();
    }
    //渲染大尺寸组件
    async renderLarge() {
        return this.renderUI()
    }
    //加载下载数据
    async getData() {
        //start_date 1639891218374 2021-12-19 13:20:18
        //end_date   1648963218374 2022-04-03 13:20:18
        let end=new Date().getTime()
        let start=new Date(end- 15*7 * 24 * 3600 * 1000).getTime()
        let api = 'https://www.yuque.com/api/users/1493705/hotmap?end_date='+end+'&start_date='+start
        let req = new Request(api)
        let res = await req.loaddaySON()
        console.log(res)
        return res
    }
    //加载远程图片
    async getImage(url) {
        let req = new Request(url)
        return await req.loadImage()
    }
    //编辑测试使用
    async test() {
        if (config.runsInWidget) return
        //this.widgetSize = 'small'
        //let w1 = await this.render()
        //await w1.presentSmall()
        this.widgetSize = 'medium'
        let w2 = await this.render()
        await w2.presentMedium()
        //this.widgetSize = 'large'
        //let w3 = await this.render()
        //await w3.presentLarge()
    }
    //组件单独在桌面运行时调用
    async init() {
        if (!config.runsInWidget) return
        let widget = await this.render()
        Script.setWidget(widget)
        Script.complete()
    }
}
module.exports = Im3xWidget
// 如果是在编辑器内编辑、运行、测试，则取消注释这行，便于调试：// 
await new Im3xWidget().test()
// 如果是组件单独使用（桌面配置选择这个组件使用，则取消注释这一行：// 
await new Im3xWidget(args.widgetParameter).init()
