class IosWidget {
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
            return await this.renderUI()
        } else if (this.widgetSize === 'large') {
            return await this.renderUI()
        } else {
            return await this.renderUI()
        }
    }

    /**
     * 将一个日期对象转成日期字符串（例如20220403）
     * @param {*} datetime 日期对象
     * @returns            日期字符串（例如20220403）
     */
    getTime(datetime) {
        var year = datetime.getFullYear();
        var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
        var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
        var text = "" + year + month + date;
        return text;
    }

    /**
     * 获取指定日期的创作等级
     * @param {*} list 等级数组
     * @param {*} dt   日期 例如：20220403
     * @returns        等级：-1到5 或者空
     */
    getLevel(list, dt) {
        var level = "";
        list.forEach((item) => {
            if (item.biz_date == dt) {
                level = item.level
            }
        })
        return level
    }

    async renderUI() {
        let container = new ListWidget()

        //标题
        let header = container.addStack()
        header.centerAlignContent()

        let icon = header.addImage(await this.getImage('https://gw.alipayobjects.com/mdn/prod_resou/afts/img/A*OwZWQ68zSTMAAAAAAAAAAABkARQnAQ'))
        icon.imageSize = new Size(40, 16)
        
        let title = header.addText("｜创作指数")
        title.font = Font.systemFont(10)
        
        container.addSpacer(4)

        //创作指数
        //start_date 开始日期 1639891218374 2021-12-19 13:20:18
        //end_date   结束日期 1648963218374 2022-04-03 13:20:18
        var dayTime = 24 * 3600 * 1000;
        var weekTime = 7 * dayTime;
        let end = new Date().getTime()
        let start = new Date(end - 15 * weekTime).getTime()
        let data = await this.getData(end, start)
        let weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
        for (let day = 0; day < weekDay.length; day++) {
            let row = container.addStack()

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
            for (let week = 0; week < 16; week++) {
                let context = new DrawContext()
                context.size = new Size(ww, h)
                context.opaque = false
                context.respectScreenScale = false

                //数据返回106条               
                //界面上显示16周，数据只有15周加1天
                //           -15周           -1周                 0      
                //周日     2021-12-19                        2022-04-03  
                //周1      2022-12-20 
                //周2       21
                //周3       22
                //周4       23
                //周5       24
                //周6       25
                var offsetDate = new Date(start + (dayTime * day) + (week) * weekTime)
                console.log(offsetDate);
                var dt = this.getTime(offsetDate)
                console.log(dt)
                var level = this.getLevel(data.data.hotmap, dt);
                //console.log(level)
                let hotColor = "";
                console.log(level + "");
                switch (level + "") {
                    case "":
                    case "-1":
                    default:
                        hotColor = "#ffffff";
                        break;
                    case "0":
                        hotColor = "#f5f5f5";
                        break;
                    case "1":
                        hotColor = "#e1f2e2";
                        break;
                    case "2":
                        hotColor = "#bee8c8";
                        break;
                    case "3":
                        hotColor = "#6bb579";
                        break;
                    case "4":
                        hotColor = "#397549";
                        break;
                    case "5":
                        hotColor = "#21472c";
                        break;
                }
                //console.log(hotColor);

                context.setFillColor(new Color(hotColor, 1))
                let path = new Path()
                path.addRoundedRect(new Rect(0, 0, ww, h), 0, 0)
                context.addPath(path)
                context.fillPath()
                row.addImage(context.getImage())
                row.addSpacer(3)
            }
            container.addSpacer(3)
        }
        return container
    }
    //加载下载数据
    async getData(end, start) {
        let api = 'https://www.yuque.com/api/users/1493705/hotmap?end_date=' + end + '&start_date=' + start
        let req = new Request(api)
        let res = await req.loadJSON()
        //console.log(res)
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
module.exports = IosWidget
// 如果是在编辑器内编辑、运行、测试，则取消注释这行，便于调试：// 
await new IosWidget().test()
// 如果是组件单独使用（桌面配置选择这个组件使用，则取消注释这一行：// 
await new IosWidget(args.widgetParameter).init()
