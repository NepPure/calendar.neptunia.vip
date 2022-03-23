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
			listApi: `https://api-biligame.neppure.vip/news/list.action?gameExtensionId=45&positionId=2&pageNum=1&pageSize=20`,
			detailApi: 'https://api-biligame.neppure.vip/news/',//https://api.biligame.com/news/9940.action
			eventCalendar: []
		}
	},
	methods: {
		initRemoteData() {
			const result = request(this.listApi)

			if (!result || result.code !== 0) {
				console.error('接口数据异常');
				return;
			}

			let eventDetail = {};
			for (const item of result.data) {
				const detail = request(this.detailApi + `${item.id}.action`)
				if (!detail || detail.code !== 0) {
					continue
				}
				eventDetail[item.id] = detail.data.content
			}

			const dateRegex = /(\d{4,})年(\d+)月(\d+)日.*[~|～].*?(\d+)月(\d+)日/i
			const startTimeRegex = /(\d+):(\d+).*?[~|～]/
			const endTimeRegex = /[~|～].*?(\d+):(\d+)/
			const imageRegex = /<img src="\/\/i.\.hdslb\.com\/(.+?)"/i

			let datalist = result.data
			for (let item of datalist) {
				if (!eventDetail[item.id]) {
					continue
				}

				let start = moment();
				let end = moment()
				let image = ''


				const content = eventDetail[item.id];
				const datalist = content.match(dateRegex);
				if (!datalist) {
					continue
				}

				/**
				 * 0: "2022年3月24日（周四）维护后～4月7日"
1: "2022"
2: "3"
3: "24"
4: "4"
5: "7"
				 */

				const startYear = datalist[1]
				const startMonth = datalist[2]
				const startDay = datalist[3]
				let startHour = '00'
				let startMinute = '00'

				const endYear = startMonth > datalist[4] ? startYear + 1 : startYear // 翻年了
				const endMonth = datalist[4]
				const endDay = datalist[5]
				let endHour = '23'
				let endMinute = '59'

				const startlist = content.match(startTimeRegex);
				if (startlist) {
					startHour = startlist[1]
					startMinute = startlist[2]
				}

				const endlist = content.match(endTimeRegex);
				if (startlist) {
					endHour = endlist[1]
					endMinute = endlist[2]
				}
				start = moment(`${startYear}/${startMonth}/${startDay} ${startHour}:${startMinute}`)
				end = moment(`${endYear}/${endMonth}/${endDay} ${endHour}:${endMinute}`)

				const imageSearch = content.match(imageRegex);
				if (imageSearch) {
					image = 'https://i0-hdslb.neppure.vip/' + imageSearch[1]
				}

				let event = {
					start: start,
					end: end,
					startDate: start.format('YYYY/MM/DD'), // 开始日期
					endDate: end.format('YYYY/MM/DD'), // 结束日期
					startTime: start.format('HH:mm'), // 开始时间 可以不填，填了会展示，
					endTime: end.format('HH:mm'), // 结束时间 可以不填，填了会展示
					abbreviation: item['title'], // 缩写（直接展示）
					eventName: item['title'], // 全称（悬停超过1秒才会显示）
					type: 1,
					link: `https://game.bilibili.com/fgo/news.html#!news/0/1/${item.id}`,
					color: '#2196f3', // 标签颜色#2196f3 常规 #ffc107 卡池 #580dda 深渊 #f764ad 活动
					img: image, // 背景图片
				}
				if (item['title'].indexOf('维护') >= 0) {
					event.type = 4
					event.color = '#580dda'
				}
				else if (item['title'].indexOf('召唤') >= 0 ||
					item['title'].indexOf('福袋') >= 0) {
					event.type = 3
					event.color = '#ffc107'
				} else if (item['title'].indexOf('活动') >= 0 ||
					item['title'].indexOf('限时') >= 0) {
					event.type = 2
					event.color = '#f764ad'
				}

				this.eventCalendar.push(event);
			}

			this.eventCalendar = _
				.chain(this.eventCalendar)
				.orderBy(['type', 'end'], ['desc', 'asc'])
				.value()
		}
	}
});
