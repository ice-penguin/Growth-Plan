<template>
  <div class="menu-icon-select">
    <div class="menu-icon-select-toolbar">
      <a-input-search
        v-model="keyword"
        allow-clear
        placeholder="搜索图标名称，如 home、team、setting"
        style="flex: 1"
      />
      <a-button
        style="margin-left: 8px"
        icon="close"
        title="清除图标"
        @click="handleChange('')"
      />
    </div>

    <div v-if="value" class="menu-icon-select-preview">
      <span class="menu-icon-select-preview-label">已选</span>
      <a-icon :type="value" class="menu-icon-select-preview-icon" />
      <span class="menu-icon-select-preview-name">{{ value }}</span>
    </div>

    <div class="menu-icon-select-meta">
      共 {{ iconTypes.length }} 个图标，当前显示 {{ filteredTypes.length }} 个
    </div>

    <div class="menu-icon-select-grid">
      <div
        v-for="type in filteredTypes"
        :key="type"
        :class="['menu-icon-select-item', { active: value === type }]"
        :title="type"
        @click="handleChange(type)"
      >
        <a-icon :type="type" class="menu-icon-select-item-icon" />
        <span class="menu-icon-select-item-name">{{ type }}</span>
      </div>
      <a-empty v-if="filteredTypes.length === 0" description="没有匹配的图标" />
    </div>
  </div>
</template>

<script>
import { getMenuIconTypes } from '@/config/menuIcons'

export default {
  name: 'MenuIconSelect',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      keyword: '',
      iconTypes: getMenuIconTypes()
    }
  },
  computed: {
    filteredTypes() {
      const q = (this.keyword || '').trim().toLowerCase()
      if (!q) {
        return this.iconTypes
      }
      return this.iconTypes.filter(type => type.toLowerCase().includes(q))
    }
  },
  methods: {
    handleChange(val) {
      const next = val || ''
      this.$emit('input', next)
      this.$emit('change', next)
    }
  }
}
</script>

<style lang="less" scoped>
.menu-icon-select-toolbar {
  display: flex;
  align-items: center;
}

.menu-icon-select-preview {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.menu-icon-select-preview-label {
  margin-right: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.menu-icon-select-preview-icon {
  font-size: 28px;
  margin-right: 12px;
}

.menu-icon-select-preview-name {
  color: rgba(0, 0, 0, 0.65);
  font-family: monospace;
}

.menu-icon-select-meta {
  margin: 8px 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.menu-icon-select-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fff;
}

.menu-icon-select-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  padding: 8px 4px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;

  &:hover {
    background: #e6f7ff;
    border-color: #91d5ff;
  }

  &.active {
    background: #1890ff;
    border-color: #1890ff;
    color: #fff;

    .menu-icon-select-item-name {
      color: #fff;
    }
  }
}

.menu-icon-select-item-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.menu-icon-select-item-name {
  width: 100%;
  font-size: 11px;
  line-height: 1.2;
  text-align: center;
  color: rgba(0, 0, 0, 0.65);
  word-break: break-all;
}
</style>
