import Vue from "../public/js/vue.js";
import { requestText, template } from "../public/js/src.js";

export default Vue.defineComponent({
	name: "InfoApp",
	template,
	components: {

	},
	data() {
		return {
			listApi: `https://static.biligame.com/pcr/gw/calendar.js?t=${moment()}`,
			detailApi: '',
			ignoredKeyWords: [
				"修复",
				"版本内容专题页",
				"米游社",
				"调研",
				"防沉迷",
				"问卷",
				"公平运营"
			],
			tableHeaderData: [],
			weekUnixData: [],
			evetData: [],
			eventCalendar: []
		}
	},
	methods: {
		init() {
			// 从api获取数据
			this.initRemoteData();
			// 获取最近7天的数据
			this.getWeekUnixData();
			// 处理日历表头数据
			this.getTableHeaderData();
			// 处理活动列表数据
			this.evetDataHandle();
		},

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
				}
				this.eventCalendar.push(tevent)
			}

			this.eventCalendar = _
				.chain(this.eventCalendar)
				.orderBy(['type', 'end'], ['desc', 'asc'])
				.value()
		},


		/**
		 * 从今天开始计算，获取最近7天的时间戳
		 */
		getWeekUnixData() {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			// 获取今天0:00的数据
			const todayUnix = today.getTime();
			for (let i = 0; i < 7; i++) {
				let iTime = todayUnix + 24 * 60 * 60 * 1000 * i;
				this.weekUnixData.push(iTime);
			};
		},



		/**
		 * 表头数据处理
		 */
		getTableHeaderData() {
			this.weekUnixData.forEach((item, index) => {
				const weekNameList = ['日', '一', '二', '三', '四', '五', '六'];
				const weekIndex = new Date(item).getDay();
				const weekName = `星期${weekNameList[weekIndex]}`;
				// 获取MM.DD格式的日期
				const date = this.timeHandle(item);
				const tableHeaderItem = {
					weekName,
					date,
					isToday: index === 0,
				}
				this.tableHeaderData.push(tableHeaderItem);
			})
		},

		/**
		 * 时间格式处理，处理后的格式：MM.DD
		 * @param {string} time 时间,new Date()可以处理的类型
		 * @returns {string} 日期 格式：MM：DD
		 */
		timeHandle(time) {
			// 去掉年, 处理成 MM.DD格式
			const timeObj = new Date(time);
			const month = timeObj.getMonth() + 1;
			const day = timeObj.getDate()
			const iDateNoYear = `${month}.${day}`;
			return iDateNoYear;
		},

		/**
	   * 根据活动的配置数据，生成日历所需数据
	   */
		evetDataHandle() {
			let sum = 0;
			this.eventCalendar.forEach((item) => {
				let newItem = item;
				const { startDate, endDate } = item;
				const startDateUnix = new Date(startDate).getTime();
				const endDateUnix = new Date(endDate).getTime();
				const fristDayUinx = this.weekUnixData[0];
				const lastDayUinx = this.weekUnixData[6];

				// 符合以下条件，才会被存入活动列表中
				// 判定该活动时间是否需要展示
				if ((startDateUnix <= lastDayUinx) && (endDateUnix >= fristDayUinx)) {
					// 当前活动列表数组长度小于4，由于小屏banner高度不够，最多只能显示4个活动
					if (true) {
						// 获取开始日期和结束日期在日历上对应的索引
						const timeIndex = this.getCalendarIndex(item.startDate, item.endDate);
						const { startTimeIndex, endTimeIndex } = timeIndex;

						// 计算宽度
						let weekDay = 1;
						if (item.startDate !== item.endDate) {
							weekDay = Math.abs(endTimeIndex - startTimeIndex) + 1;
						}
						newItem.weekDay = weekDay;

						// 计算出开始的位置
						newItem.startIndex = startTimeIndex;

						// 判断使用哪种格式
						newItem.formatTypes = this.formatHandle(newItem);

						// 活动结束日期是否在近7天
						newItem.isLastWeek = endDateUnix <= lastDayUinx;

						this.evetData.push(newItem);
						sum = sum + 1;
					}
				}
			});

			// if (this.eventCalendar.length === 0) {
			// 	this.$store.commit("home/setIsSwiperShow", true);
			// }
		},


		/**
		 * 获取活动开始日期与活动结束日期在日历上的索引
		 * @param {string} startDate 活动开始日期
		 * @param {string} endDate 活动结束日期
		 */
		getCalendarIndex(startDate, endDate) {
			const startDateUnix = new Date(startDate).getTime();
			const endDateUnix = new Date(endDate).getTime();
			const fristDayUnix = this.weekUnixData[0];
			const lastdayUnix = this.weekUnixData[6];
			let startTimeIndex = -1;
			let endTimeIndex = -1;
			// 单日活动逻辑
			if (startDate === endDate) {
				const curIndex = this.weekUnixData.findIndex(item => {
					return item === startDateUnix;
				});
				startTimeIndex = curIndex;
				endTimeIndex = curIndex;
				// 多日活动逻辑
			} else {
				// 获取开始日期索引
				startTimeIndex = this.getStarTimeIndex({
					startDateUnix,
					fristDayUnix,
					lastdayUnix
				});
				// 获取结束日期索引
				endTimeIndex = this.getEndimeIndex({
					endDateUnix,
					fristDayUnix,
					lastdayUnix
				});
			}
			return {
				startTimeIndex,
				endTimeIndex
			};
		},


		/**
		 * 获取开始的时间的索引
		 * @param {number} obj.startDateUnix 活动开始日期时间戳
		 * @param {number} obj.fristDayUnix 第一天的时间戳
		 * @param {number} obj.lastdayUnix 第七天的时间戳
		 */
		getStarTimeIndex(obj) {
			let startTimeIndex = -1;
			const { startDateUnix, fristDayUnix, lastdayUnix } = obj;
			if (startDateUnix && startDateUnix <= lastdayUnix) {
				if (startDateUnix <= fristDayUnix) {
					startTimeIndex = 0;
				} else {
					startTimeIndex = this.weekUnixData.findIndex(item => {
						return item === startDateUnix;
					});
				}
			}
			return startTimeIndex;
		},

		/**
		 * 获取结束的时间的索引
		 * @param {number} obj.endDateUnix 活动结束日期时间戳
		 * @param {number} obj.fristDayUnix 第一天的时间戳
		 * @param {number} obj.lastdayUnix 第七天的时间戳
		 */
		getEndimeIndex(obj) {
			let endTimeIndex = -1;
			const { endDateUnix, fristDayUnix, lastdayUnix } = obj;
			if (endDateUnix && endDateUnix >= fristDayUnix) {
				if (endDateUnix >= lastdayUnix) {
					endTimeIndex = 6;
				} else {
					endTimeIndex = this.weekUnixData.findIndex(item => {
						return item === endDateUnix;
					});
				}
			}
			return endTimeIndex;
		},

		/**
		 * 文案格式处理
		 * @param {string} data.startDate 活动开始日期
		 * @param {string} data.endDate 活动结束日期
		 * @param {string} data.startTime 开始时间
		 * @param {string} data.endTime 结束时间
		 */
		formatHandle(data) {
			// 文案格式
			const format = {
				startAndEnd: 1, // 有开始日期与结束日期
				onlyStartTime: 2, // 只有开始时间
				onlyEndTime: 3 // 只有结束时间
			};
			let reFrormat = 0;
			const { weekDay = 0, startTime, endTime } = data;
			// 1 本周天数>1
			if (weekDay > 1) {
				reFrormat = format.startAndEnd;
				// 2 本周天数为1 且有开始时间
			} else if (weekDay === 1 && startTime) {
				reFrormat = format.onlyStartTime;
				// 3 本周天数为1 且有结束时间
			} else if (weekDay === 1 && endTime) {
				reFrormat = format.onlyEndTime;
			}

			return reFrormat;
		},

		/**
		 * 前往活动链接
		 * @param {string} link 网站链接
		 */
		goEventLink(link) {
			window.open(link);
		}
	},
	created() {
		this.init();
	}
});
