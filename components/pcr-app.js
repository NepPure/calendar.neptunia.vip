import Vue from "../public/js/vue.js";
import { requestText, template, mymixin, request } from "../public/js/src.js";

export default Vue.defineComponent({
	name: "InfoApp",
	template,
	mixins: [mymixin],
	components: {

	},
	data() {
		return {
			listApi: `https://static.biligame.com/pcr/gw/calendar.js?t=${moment().unix()}`,
			detailApi: 'https://le1-prod-all-gs-gzlj.bilibiligame.neppure.vip/information/ajax_announce?category=1&offset=',
			detailList: [],
			ignoredKeyWords: [
				"修复",
				"版本内容专题页",
				"米游社",
				"调研",
				"防沉迷",
				"问卷",
				"公平运营"
			],
			eventCalendar: []
		}
	},
	computed: {
		imgDic() {
			let result = {}
			const list = _.reverse(this.detailList)
			const regx = /「(.+)」/i
			for (const detail of list) {
				let img = detail.title.slider_image
				if (!img) {
					img = detail.title.thumbnail_image
				}

				if (!img) {
					continue
				}

				if (detail.title.title.indexOf('团队战') >= 0) {
					result['团队战'] = img
					continue
				}

				if (detail.title.title.indexOf('露娜之塔') >= 0) {
					result['露娜之塔'] = img
					continue
				}

				if (detail.title.title.indexOf('助力庆典') >= 0) {
					result['助力庆典'] = img
					continue
				}


				if (detail.title.title.indexOf('大师币') >= 0) {
					result['大师币'] = img
					continue
				}

				if (detail.title.title.indexOf('普通') >= 0 &&
					detail.title.title.indexOf('2倍') >= 0) {
					result['普通2'] = img
					continue
				}

				if (detail.title.title.indexOf('普通') >= 0 &&
					detail.title.title.indexOf('3倍') >= 0) {
					result['普通3'] = img
					continue
				}

				if (detail.title.title.indexOf('调查') >= 0 &&
					detail.title.title.indexOf('2倍') >= 0) {
					result['调查2'] = img
					continue
				}

				if (detail.title.title.indexOf('调查') >= 0 &&
					detail.title.title.indexOf('3倍') >= 0) {
					result['调查3'] = img
					continue
				}


				if (detail.title.title.indexOf('经验') >= 0 &&
					detail.title.title.indexOf('倍') >= 0) {
					result['经验'] = img
					continue
				}

				if (detail.title.title.indexOf('探索') >= 0 &&
					detail.title.title.indexOf('倍') >= 0) {
					result['探索'] = img
					continue
				}


				if (detail.title.title.indexOf('高难') >= 0 &&
					detail.title.title.indexOf('倍') >= 0) {
					result['高难'] = img
					continue
				}

				if (detail.title.title.indexOf('困难') >= 0 &&
					detail.title.title.indexOf('2倍') >= 0) {
					result['困难2'] = img
					continue
				}

				if (detail.title.title.indexOf('困难') >= 0 &&
					detail.title.title.indexOf('3倍') >= 0) {
					result['困难3'] = img
					continue
				}

				if (detail.title.title.indexOf('地下城') >= 0 &&
					detail.title.title.indexOf('倍') >= 0) {
					result['地下城'] = img
					continue
				}

				if (detail.title.title.indexOf('体力') >= 0 &&
					detail.title.title.indexOf('倍') >= 0) {
					result['体力'] = img
					continue
				}


				if (detail.title.title.indexOf('附奖扭蛋') >= 0) {
					result['附奖扭蛋'] = img
					continue
				}

				if (detail.title.title.indexOf('家具') >= 0) {
					result['家具'] = img
					continue
				}

				//兜底
				const mat = detail.title.title.match(regx)
				if (mat) {
					result[mat[1]] = img
				}
			}

			return result
		}
	},
	methods: {
		getCnHdtype(hdtype, hdtitle) {
			if (hdtype === "tdz") {
				return 4
			}
			else if (hdtitle.indexOf('免费十连') >= 0) {
				return 4
			}
			else if (hdtype === "qdhd") {
				if (hdtitle && hdtitle.indexOf('扭蛋') >= 0) {
					return 2
				}
				if (hdtitle && hdtitle.indexOf('露娜') >= 0) {
					return 2
				}
				return 3
			}
			else if (hdtype === "jqhd") {
				return 2
			}
			else {
				return 1
			}
		},

		getColor(type) {
			// 标签颜色#2196f3 常规 #ffc107 卡池 #580dda 深渊 #f764ad 活动
			if (type > 3) {
				return '#580dda'
			}
			else if (type > 2) {
				return '#ffc107'
			}
			else if (type > 1) {
				return '#f764ad'
			}
			else {
				return '#2196f3'
			}
		},

		getImg(tevent) {
			if (tevent.hdtype === 'tdz') {
				if (this.imgDic['团队战']) {
					return this.imgDic['团队战']
				}
			}

			if (tevent.title.indexOf('露娜之塔') >= 0) {
				if (this.imgDic['露娜之塔']) {
					return this.imgDic['露娜之塔']
				}
			}

			if (tevent.title.indexOf('大师币') >= 0 &&
				tevent.title.indexOf('倍') >= 0) {
				if (this.imgDic['大师币']) {
					return this.imgDic['大师币']
				}
			}

			if (tevent.title.indexOf('调查') >= 0 &&
				tevent.title.indexOf('2倍') >= 0) {
				if (this.imgDic['调查2']) {
					return this.imgDic['调查2']
				}
			}

			if (tevent.title.indexOf('调查') >= 0 &&
				tevent.title.indexOf('3倍') >= 0) {
				if (this.imgDic['调查3']) {
					return this.imgDic['调查3']
				}
			}

			if (tevent.title.indexOf('普通') >= 0 &&
				tevent.title.indexOf('2倍') >= 0) {
				if (this.imgDic['普通2']) {
					return this.imgDic['普通2']
				}
			}

			if (tevent.title.indexOf('普通') >= 0 &&
				tevent.title.indexOf('3倍') >= 0) {
				if (this.imgDic['普通3']) {
					return this.imgDic['普通3']
				}
			}

			if (tevent.title.indexOf('经验') >= 0 &&
				tevent.title.indexOf('倍') >= 0) {
				if (this.imgDic['经验']) {
					return this.imgDic['经验']
				}
			}

			if (tevent.title.indexOf('探索') >= 0 &&
				tevent.title.indexOf('倍') >= 0) {
				if (this.imgDic['探索']) {
					return this.imgDic['探索']
				}
			}

			if (tevent.title.indexOf('高难') >= 0 &&
				tevent.title.indexOf('倍') >= 0) {
				if (this.imgDic['高难']) {
					return this.imgDic['高难']
				}
			}

			if (tevent.title.indexOf('困难') >= 0 &&
				tevent.title.indexOf('2倍') >= 0) {
				if (this.imgDic['困难2']) {
					return this.imgDic['困难2']
				}
			}

			if (tevent.title.indexOf('困难') >= 0 &&
				tevent.title.indexOf('3倍') >= 0) {
				if (this.imgDic['困难3']) {
					return this.imgDic['困难3']
				}
			}

			if (tevent.title.indexOf('地下城') >= 0 &&
				tevent.title.indexOf('倍') >= 0) {
				if (this.imgDic['地下城']) {
					return this.imgDic['地下城']
				}
			}

			if (tevent.title.indexOf('体力') >= 0 &&
				tevent.title.indexOf('倍') >= 0) {
				if (this.imgDic['体力']) {
					return this.imgDic['体力']
				}
			}

			if (tevent.title.indexOf('附奖扭蛋') >= 0) {
				if (this.imgDic['附奖扭蛋']) {
					return this.imgDic['附奖扭蛋']
				}
			}

			if (tevent.title.indexOf('家具') >= 0) {
				if (this.imgDic['家具']) {
					return this.imgDic['家具']
				}
			}

			if (tevent.title.indexOf('助力庆典') >= 0) {
				if (this.imgDic['助力庆典']) {
					return this.imgDic['助力庆典']
				}
			}

			//兜底
			for (const key in this.imgDic) {
				if (tevent.title.indexOf(key) >= 0) {
					return this.imgDic[key]
				}
			}

			// 还找不到？不会分词了
			for (const key in this.imgDic) {
				const r = key.match('\([^\x00-\xff]+)')
				if (!r) {
					continue
				}
				if (tevent.title.indexOf(r[1]) >= 0) {
					return this.imgDic[key]
				}
			}
			return ''
		},

		initRemoteData() {
			// this.eventCalendar = [{
			// 	abbreviation: "第二十五期 团队战",
			// 	color: "#580dda",
			// 	endDate: "2022/03/30",
			// 	endTime: "23:59",
			// 	eventName: "第二十五期 团队战 3/25-3/30",
			// 	img: "",
			// 	link: "",
			// 	startDate: "2022/03/25",
			// 	startTime: "05:00",
			// 	type: 4
			// }]
			// return
			const raw = requestText(this.listApi)
			const rawRegex = /\s*var\s+data\s*\=\s*(\[[\w\W]*?\])/i;
			const result = eval(raw.match(rawRegex)[1]);

			if (!result || result.length === 0) {
				console.error('接口数据异常');
				return;
			}

			for (let index = 0; index <= 2; index++) {
				const detail = request(this.detailApi + `${index * 10}&t=${moment().unix()}`)
				detail.announce_list.forEach(m => this.detailList.push(m))
			}


			let tmpEvent = {}
			const regex = /<div class='cl-t'>(.+?)<\/div>(?:<div class='cl-d'>(.+?)<\/div>)?/ig;

			const filterTime = moment().add(-60, 'day')

			for (const monthData of result) {
				/**
				 * day: {1: {…}, 2: {…}, 3: {…}, 4: {…}, 5: {…}, 6: {…}, 7: {…}, 8: {…}, 9: {…}, 10: {…}, 11: {…}, 12: {…}, 13: {…}, 14: {…}, 15: {…}, 16: {…}, 17: {…}, 18: {…}, 19: {…}, 20: {…}, 21: {…}, 22: {…}, 23: {…}, 24: {…}, 25: {…}, 26: {…}, 27: {…}, 28: {…}, 29: {…}, 30: {…}}
				 * month: "4"
				 * year: "2022"
				 */
				const ctime = moment(`${monthData.year}/${monthData.month}/1`)
				if (ctime < filterTime) {
					continue
				}
				for (const [hdday, hddic] of Object.entries(monthData.day)) {
					let hdstarttime = moment(`${monthData.year}/${monthData.month}/${hdday} 05:00`)

					for (const [hdtype, hdcontent] of Object.entries(hddic)) {
						if (!hdcontent) {
							continue
						}
						let hdendtime = moment()

						if (hdtype === 'jssr') {
							hdstarttime = moment(`${monthData.year}/${monthData.month}/${hdday} 00:00`)
							hdendtime = hdendtime = moment(`${monthData.year}/${monthData.month}/${hdday} 23:59`)
						}

						if (hdtype === "qdhd") {
							// 双倍和抽卡一般04:59
							hdendtime = moment(`${monthData.year}/${monthData.month}/${hdday} 04:59`)
						}
						else {
							hdendtime = hdendtime = moment(`${monthData.year}/${monthData.month}/${hdday} 23:59`)
						}

						const hdcontentList = hdcontent.matchAll(regex)
						for (const hdc of hdcontentList) {
							if (hdc.length < 2) {
								continue
							}
							let hdtitle = hdc[1]
							const abbrTitle = hdtitle
							if (hdc.length > 2 && hdc[2]) {
								hdtitle = hdtitle + " " + hdc[2]
							}

							let intemp = false
							for (const tmpTile in tmpEvent) {
								if (tmpTile !== hdtitle) {
									continue
								}
								intemp = true
								// 更新时间，反正要遍历不是
								if (hdstarttime < tmpEvent[hdtitle]["start"]) {
									tmpEvent[hdtitle]["start"] = hdstarttime

								}
								if (hdendtime > tmpEvent[hdtitle]["end"]) {
									tmpEvent[hdtitle]["end"] = hdendtime
								}
							}

							if (!intemp) {
								tmpEvent[hdtitle] = {
									"hdtype": hdtype,
									"title": hdtitle,
									"abbrTitle": abbrTitle,
									"start": hdstarttime,
									"end": hdendtime,
									"type": this.getCnHdtype(hdtype, hdtitle),
								}
							}
						}
					}
				}
			}

			for (const [key, event] of Object.entries(tmpEvent)) {
				if (event["end"] < event["start"]) {
					event["end"] = moment(event["start"].format('YYYY/MM/DD 23:59'))
				}


				let tevent = {
					title: event['title'],
					start: event.start,
					end: event.end,
					startDate: event.start.format('YYYY/MM/DD'), // 开始日期
					endDate: event.end.format('YYYY/MM/DD'), // 结束日期
					startTime: event.start.format('HH:mm'), // 开始时间 可以不填，填了会展示，
					endTime: event.end.format('HH:mm'), // 结束时间 可以不填，填了会展示
					abbreviation: event['abbrTitle'], // 缩写（直接展示）
					eventName: event['title'], // 全称（悬停超过1秒才会显示）
					type: event.type,
					link: '',
					color: this.getColor(event.type),
					img: "", // 背景图片
					hdtype: event.hdtype
				}

				tevent.img = this.getImg(tevent)
				this.eventCalendar.push(tevent)
			}

			this.eventCalendar = _
				.chain(this.eventCalendar)
				.orderBy(['type', 'end'], ['desc', 'asc'])
				.value()
		}
	}
});
