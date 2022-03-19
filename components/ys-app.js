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
			listApi: 'https://api-takumi.neppure.vip/common/hk4e_cn/announcement/api/getAnnList?game=hk4e&game_biz=hk4e_cn&lang=zh-cn&bundle_id=hk4e_cn&platform=pc&region=cn_gf01&level=55&uid=100000000',
			detailApi: 'https://api-takumi.neppure.vip/common/hk4e_cn/announcement/api/getAnnContent?game=hk4e&game_biz=hk4e_cn&lang=zh-cn&bundle_id=hk4e_cn&platform=pc&region=cn_gf01&level=55&uid=100000000',
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
	methods: {
		initRemoteData() {
			let result = request(this.listApi)
			let detailResult = request(this.detailApi)

			if (result.retcode !== 0 || detailResult.retcode !== 0) {
				console.error('接口数据异常');
				return;
			}

			const regex = /(\d+)\/(\d+)\/(\d+)\s(\d+):(\d+):(\d+)/i;

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
					if (eventDetail[item["ann_id"]]) {
						let content = eventDetail[item["ann_id"]]['content'];
						let datalist = content.match(regex);
						if (datalist && datalist.length >= 7) {
							let ctime = moment(datalist[0])
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
					if (item['title'].indexOf('双倍') >= 0) {
						event.type = 4
						event.color = '#580dda'
					}
					else if (item['tag_label'].indexOf('扭蛋') >= 0) {
						event.type = 3
						event.color = '#ffc107'
					} else if (item['tag_label'].indexOf('活动') >= 0) {
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


		},
	}
});
