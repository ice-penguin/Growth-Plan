<!--
 * @Author: jianxl
 * @LastEditors: jianxl
 * @I love coding
-->
<template>
  <div class="week-tab">
    <!-- <a-radio-group :tab-bar-gutter="16" v-model="tabPosition">
      <a-radio-button>
        <template slot="value">
          <div>周一</div>
          <div>12-01</div>
        </template>
      </a-radio-button>
      <a-radio-button value="bottom">
        bottom
      </a-radio-button>
      <a-radio-button value="left">
        left
      </a-radio-button>
      <a-radio-button value="right">
        right
      </a-radio-button>
    </a-radio-group> -->
    <div class="flex btn-grounp">
      <div
        class="btn"
        v-for="(day, index) in btnGroups"
        :key="day.des"
        @click="choosedTab(day, index)"
        :class="{'btn-active': day.isChoosed}"
      >
        <div v-if="index!==btnGroups.length-1" class="btn-title">{{ day.title }}</div>
        <div v-else>
          <img :src="day.img" style="vertical-align: text-top;" width="16" alt="">
          {{ day.title }}
        </div>
        <div class="btn-des">
          {{ day.des }}
        </div>
        <a-date-picker
          size="small"
          :allow-clear="false"
          v-if="index===btnGroups.length-1"
          :value="moment(selectedDate, dateFormat)"
          :format="dateFormat"
          @change="onChangeDate"
          input-read-only
          style="width: 120px;position: absolute;top: 0;left: 0;height: 64px;line-height: 64px;opacity: 0;cursor: pointer;"
          :popup-style="{
            top: '20px'
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getWeekName } from '@/utils/util'
export default {
  data() {
    return {
      tabPosition: 'top',
      btnGroups: [],
      dateFormat: 'YYYY-MM-DD',
      selectedDate: new Date()
    }
  },
  created() {
    this.getWeekDay()
  },
  methods: {
    callback(val) {
      console.log(val)
    },
    // 生成日期
    createDay(i) {
      const nowDay = new Date()
      nowDay.setDate(nowDay.getDate() + i)
      return {
        des: this.moment(nowDay).format('MM-DD'),
        title: getWeekName(nowDay.getDay()),
        date: nowDay
      }
    },

    // 获取近7天日期
    getWeekDay() {
      for (let i = 0; i < 8; i++) {
        this.btnGroups.push(this.createDay(i))
      }
      this.btnGroups.push(
        {
          title: '查看日历',
          img: require('@/assets/images/calendar_icon.png'),
          des: this.moment(new Date()).format('YYYY-MM-DD')
        }
      )
      this.btnGroups[0].isChoosed = true
      this.$emit('onChange', this.btnGroups[0])
    },

    choosedTab(tab, index) {
      if (index !== 8) {
        if (!tab.isChoosed) {
          this.btnGroups.map(btn => {
            btn.isChoosed = false
          })
          
          this.selectedDate = this.moment(tab.date).format('YYYY-MM-DD')
          this.btnGroups[8].des = this.moment(tab.date).format('YYYY-MM-DD')
          tab.isChoosed = true
          console.log(tab)
          this.$emit('onChange', tab)
          this.$forceUpdate()
        }
      }
    },

    onChangeDate(date, str) {
      this.selectedDate = str
      this.btnGroups[8].des = str
      this.btnGroups[8].date = str
      this.$emit('onChange', this.btnGroups[8])
      this.btnGroups.map(btn => {
        btn.isChoosed = false
      })
      this.btnGroups[8].isChoosed = true
    }
  }
}
</script>
@import url('./index.css')
<style lang="less" scoped>
  /deep/ .ant-radio-button-wrapper {
    margin-right: 16px;
  }
  .flex {
    display: flex;
  }
  .btn-grounp {
    .btn {
      // width: 56px;
      // height: 56px;
      background: #FFFFFF;
      border-radius: 2px;
      border: 1px solid #D9D9D9;
      padding: 10px 12px 7px;
      text-align: center;
      margin-right: 16px;
      color: rgba(0, 0, 0, 0.65);
      position: relative;
      left: 0;
      top: 0;
      cursor: pointer;
      &-title {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        line-height: 20px;
        // padding-bottom: 4px;
        // margin-bottom: 4px;
      }
      &-des {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        line-height: 17px;
      }
      &-active {
        background: #E6F7FF;
        border-radius: 2px;
        border: 1px solid #1890FF;
        color: #1890FF;
      }
    }
  }
</style> 
