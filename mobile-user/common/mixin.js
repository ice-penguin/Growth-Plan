import store from '@/store'

const storeComputed = {}
Object.keys(store.state).forEach(function (key) {
  storeComputed[key] = function () {
    return this.$store.state[key]
  }
})

export default {
  computed: {
    ...storeComputed
  }
}
