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
            return await this.renderUI(7)
        } else if (this.widgetSize === 'large') {
            return await this.renderUI(16)
        } else {
            return await this.renderUI(16)
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

    /**
     * 渲染小组件UI
     * @param {*} weekCount 统计周数
     * @returns 
     */
    async renderUI(weekCount = 16) {
        let container = new ListWidget()

        if (!this.arg) {
            var tips = container.addText('请在小组件参数处填写语雀用户id！')
            tips.textColor = new Color("#fb7299")
            tips.font = Font.systemFont(14)

            return container
        }

        //标题
        let header = container.addStack()
        header.centerAlignContent()
        let icon = header.addImage(await this.getImage('https://gw.alipayobjects.com/mdn/prod_resou/afts/img/A*OwZWQ68zSTMAAAAAAAAAAABkARQnAQ'))
        icon.imageSize = new Size(40, 16)
        let title = header.addText("｜创作指数")
        title.font = Font.systemFont(9)
        container.addSpacer(3)

        //创作指数
        //start_date 开始日期 1639891218374 2021-12-19 13:20:18
        //end_date   结束日期 1648963218374 2022-04-03 13:20:18
        var dayTime = 24 * 3600 * 1000;
        var weekTime = 7 * dayTime;
        let end = new Date().getTime()

        //start从周一往前推
        let start = new Date(end-(new Date().getDay()*dayTime) - (weekCount - 1) * weekTime).getTime()
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
            for (let week = 0; week < weekCount; week++) {
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
                //console.log(offsetDate);
                var dt = this.getTime(offsetDate)
                //console.log(dt)
                var level = this.getLevel(data.data.hotmap, dt);
                //console.log(level)
                let hotColor = "";
                //console.log(level + "");
                switch (level + "") {
                    case "":
                    case "-1":
                    default:
                        hotColor = "#ffffff";
                        break;
                    case "0":
                        hotColor = "#f4f5f5";
                        break;
                    case "1":
                        hotColor = "#daf6ea";
                        break;
                    case "2":
                        hotColor = "#c7f0df";
                        break;
                    case "3":
                        hotColor = "#82edc0";
                        break;
                    case "4":
                        hotColor = "#00b96b";
                        break;
                    case "5":
                        hotColor = "#00663b";
                        break;
                }
                //console.log(hotColor);

                context.setFillColor(new Color(hotColor, 1))
                let path = new Path()
                path.addRoundedRect(new Rect(0, 0, ww, h), 0, 0)
                context.addPath(path)
                context.fillPath()
                row.addImage(context.getImage())
                row.addSpacer(2)
            }
            container.addSpacer(2)
        }

        container.url="yuque://"

        return container
    }
    //加载下载数据
    async getData(end, start) {
        let api = 'https://www.yuque.com/api/users/' + this.arg + '/hotmap?end_date=' + end + '&start_date=' + start
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

        this.widgetSize = 'small'
        let w1 = await this.render()
        await w1.presentSmall()

        this.widgetSize = 'medium'
        let w2 = await this.render()
        await w2.presentMedium()

        this.widgetSize = 'large'
        let w3 = await this.render()
        await w3.presentLarge()
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
// 如果是在编辑器内编辑、运行、测试，则取消注释这行，便于调试：
await new IosWidget().test()
// 如果是组件单独使用（桌面配置选择这个组件使用，则取消注释这一行：
await new IosWidget(args.widgetParameter).init()
