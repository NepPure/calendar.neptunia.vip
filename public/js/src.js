export function parseURL(url) {
	let urlParams = url.substring(1).split("&");
	let result = {};
	for (let p of urlParams) {
		const [key, value] = p.split("=");
		result[key] = value;
	}
	return result;
}

export function request(url) {
	const Http = new XMLHttpRequest();
	Http.open("GET", url, false);
	Http.send();
	return JSON.parse(Http.responseText);
}

export function requestText(url) {
	const Http = new XMLHttpRequest();
	Http.open("GET", url, false);
	Http.send();
	return Http.responseText;
}

export const template =
	`  <!-- 活动日历 -->
	<div class="calendar-wapper">
	<div>
	<div class="m-events-calendar">
	  <div class="m-events-calendar" v-if="evetData.length">
		<div class="m-events-calenda__m-right">
		  <!-- 背景虚线 -->
		  <div class="m-events-calendar__line-container">
			<div
			  class="m-events-calendar__line-item"
			  v-for="(item, index) in tableHeaderData"
			  :key="index"
			  :class="{
				'm-events-calendar__line-item-current': item.isToday,
				'm-events-calendar__line-item-last':
				index === tableHeaderData.length
			  }"
			></div>
		  </div>
  
		  <!-- 表头 -->
		  <div class="m-events-calendar__table-header">
			<div
			  class="m-events-calendar__table-header-item"
			  v-for="(item, index) in tableHeaderData"
			  :key="index"
			  :class="{ 'm-events-calendar__table-header-current': item.isToday }"
			>
			  <div class="m-events-calendar__table-header-week">
				{{ item.weekName }}
			  </div>
			  <div class="m-events-calendar__table-header-date">
				{{ item.date }}
			  </div>
			</div>
		  </div>
  
		  <!-- 活动事件 -->
		  <div
			class="m-events-calendar__event-item-container"
			v-for="(item, index) in evetData"
			:key="index"
			@click="goEventLink(item.link)"
			:style="{
			  width: \`\${ item.weekDay * 76 + 12}px\`,
			  '-webkit-transform': \`translate(\${ item.startIndex * 76 }px)\`,
			  transform: \`translate(\${ item.startIndex * 76 }px)\`
			}"
		  >
			<div
			  class="m-events-calendar__event-item-bg"
			  :style="{ backgroundImage: \`url(\${ item.img })\` }"
			></div>
			<div
			  class="m-events-calendar__event-item-tag"
			  :style="{ backgroundColor: item.color }"
			></div>
			<div
			  class="m-events-calendar__event-item"
			  :class="{
				'm-events-calendar__event-item-not-finish': !item.isLastWeek
			  }"
			>
			  <div class="m-events-calendar__event-item-info">
				<span
				  class="m-events-calendar__event-item-act-name"
				  :title="item.eventName">
				  {{ item.abbreviation }}
				</span>
				<!-- 格式一：开始结束日期为不同的日期 -->
				<div
				  class="m-events-calendar__event-item-text"
				  v-if="item.formatTypes === 1">
				  {{ timeHandle(item.startDate) }} ~ {{ timeHandle(item.endDate) }}
				</div>
  
			  <!-- 格式二：开始结束日期为同一个 -->
			  <div
				class="m-events-calendar__event-item-time"
				v-if="item.formatTypes === 2"
			  >
				{{ item.startTime }}开始
			  </div>
			  <!-- 格式三：当天为结束日期 -->
			  <div
				class="m-events-calendar__event-item-time"
				v-if="item.formatTypes === 3"
			  >
				{{ item.endTime }}结束
			  </div>
			</div>
			<!-- 结束时间：天数等于1，切有结束时间 -->
			<div
			  class="m-events-calendar__event-item-end-time"
			  v-if="item.weekDay > 1 && item.endTime && item.isLastWeek"
			>
			  {{ item.endTime }}结束
			</div>
		  </div>
		</div>
		</div>
	  </div>
	</div>	
	<div class="text">github.com/NepPure/calendar.neptunia.vip</div>
	</div>
</div>
`;

export const mymixin = {
	data() {
		return {
			tableHeaderData: [],
			weekUnixData: [],
			evetData: [],
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

		initRemoteData() {

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
}
