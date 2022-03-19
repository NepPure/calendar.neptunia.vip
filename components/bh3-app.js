import Vue from "../public/js/vue.js";
import { request, template, mymixin } from "../public/js/src.js";

export default Vue.defineComponent({
	name: "InfoApp",
	template,
	mixins: [mymixin],
	components: {

	},
	data() {
		return {
			listApi: 'https://api-takumi.neppure.vip/common/bh3_cn/announcement/api/getAnnList?game=bh3&game_biz=bh3_cn&lang=zh-cn&sdk_presentation_style=fullscreen&sdk_screen_transparent=true&auth_appid=announcement&authkey_ver=1&sign_type=2&region=ios01&bundle_id=com.miHoYo.bh3&uid=51000000&level=88&platform=ios&channel_id=1&ann_id=1689',
			detailApi: 'https://api-takumi.neppure.vip/common/bh3_cn/announcement/api/getAnnContent?game=bh3&game_biz=bh3_cn&lang=zh-cn&bundle_id=com.miHoYo.bh3&platform=ios&region=ios01&t=1647600991&level=88&channel_id=1',
			ignoredKeyWords: [
				"封号",
				"修复",
				"爱酱&帮助",
				"公平运营",
				"防沉迷",
				"客服",
				"隐私",
				"米游社",
				"攻略",
				"社区"
			],	
			eventCalendar: []
		}
	},
	methods: {
		initRemoteData() {
			let result = request(this.listApi)
			let detailResult = request(this.detailApi)

			if (result.retcode !== 0 || detailResult.retcode !== 0) {
				console.error('接口数据异常');
				return;
			}

			const regex = /(\d{4,})?年?(\d+)月(\d+)日(\d+):(\d+)(?:(?:~|-)(?:\d{4,})?年?(?:\d+)月(?:\d+)日(?:\d+):(?:\d+))?/i;

			let eventDetail = {};
			for (let detail of detailResult['data']['list']) {
				eventDetail[detail['ann_id']] = detail;
			}
			let datalist = result['data']['list']
			for (let data of datalist) {
				for (let item of data['list']) {
					// 对公告进行过滤
					let ignore = false;
					for (let keyword of this.ignoredKeyWords) {
						if (item['title'].indexOf(keyword) > 0) {
							ignore = true;
							break;
						}
					}

					if (ignore) {
						break;
					}

					let start = moment(item['start_time']);
					let end = moment(item['end_time'])

					// 从正文查找修正开始时间
					if (eventDetail[item["ann_id"]] &&
						eventDetail[item["ann_id"]]['content'].indexOf('版本更新后') < 0) {
						let content = eventDetail[item["ann_id"]]['content'];
						let datalist = content.match(regex);
						if (datalist && datalist.length >= 6) {
							let year = moment().year()
							if (datalist[1]) {
								year = datalist[1]
							}
							let ctime = moment(`${year}-${datalist[2]}-${datalist[3]} ${datalist[4]}:${datalist[5]}`)
							if (ctime > start && ctime < end) {
								start = ctime
							}
						}
					}

					let event = {
						start: start,
						end: end,
						startDate: start.format('YYYY/MM/DD'), // 开始日期
						endDate: end.format('YYYY/MM/DD'), // 结束日期
						startTime: start.format('HH:mm'), // 开始时间 可以不填，填了会展示，
						endTime: end.format('HH:mm'), // 结束时间 可以不填，填了会展示
						abbreviation: item['title'], // 缩写（直接展示）
						eventName: item['subtitle'], // 全称（悬停超过1秒才会显示）
						type: 1,
						link: '',
						color: '#2196f3', // 标签颜色#2196f3 常规 #ffc107 卡池 #580dda 深渊 #f764ad 活动
						img: item['banner'], // 背景图片
					}

					if (item['title'].indexOf('补给') >= 0 ||
						item['title'].indexOf('精准') >= 0) {
						event.type = 3
						event.color = '#ffc107'
					} else if (item['type'] === 20) {
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
	}
});
