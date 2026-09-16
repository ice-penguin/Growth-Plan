<template>
  <div class="login-scene" aria-hidden="true">
    <div class="login-scene__stage">
      <div ref="container" class="login-scene__characters" :style="stageStyle">
        <!-- 紫色 -->
        <div
          ref="purple"
          class="character character--purple"
          :style="purpleBodyStyle"
        >
          <div ref="purpleFace" class="character__face" :style="purpleFaceStyle">
            <div
              v-for="i in 2"
              :key="'purple-eye-' + i"
              class="eyeball"
              :style="eyeballStyle(18)"
              :data-max-distance="5"
            >
              <div class="eyeball__pupil" :style="eyeballPupilStyle(7)" />
            </div>
          </div>
        </div>

        <!-- 黑色 -->
        <div
          ref="black"
          class="character character--black"
          :style="blackBodyStyle"
        >
          <div ref="blackFace" class="character__face character__face--black" :style="blackFaceStyle">
            <div
              v-for="i in 2"
              :key="'black-eye-' + i"
              class="eyeball"
              :style="eyeballStyle(16)"
              :data-max-distance="4"
            >
              <div class="eyeball__pupil" :style="eyeballPupilStyle(6)" />
            </div>
          </div>
        </div>

        <!-- 橙色 -->
        <div
          ref="orange"
          class="character character--orange"
          :style="orangeBodyStyle"
        >
          <div ref="orangeFace" class="character__face character__face--orange" :style="orangeFaceStyle">
            <div
              v-for="i in 2"
              :key="'orange-pupil-' + i"
              class="pupil"
              :style="pupilStyle(12)"
              data-max-distance="5"
            />
          </div>
        </div>

        <!-- 黄色 -->
        <div
          ref="yellow"
          class="character character--yellow"
          :style="yellowBodyStyle"
        >
          <div ref="yellowFace" class="character__face character__face--yellow" :style="yellowFaceStyle">
            <div
              v-for="i in 2"
              :key="'yellow-pupil-' + i"
              class="pupil"
              :style="pupilStyle(12)"
              data-max-distance="5"
            />
          </div>
          <div ref="yellowMouth" class="character__mouth" :style="yellowMouthStyle" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const DESIGN_WIDTH = 550
const DESIGN_HEIGHT = 400

function lerp (a, b, t) {
  return a + (b - a) * t
}

function clamp (v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function smoothAlpha (dt, duration = 0.3) {
  return 1 - Math.exp(-dt / duration)
}

export default {
  name: 'LoginSceneCanvas',
  props: {
    focusField: {
      type: String,
      default: ''
    },
    passwordVisible: {
      type: Boolean,
      default: false
    },
    passwordLength: {
      type: Number,
      default: 0
    },
    lookTarget: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      scale: 1,
      mouse: { x: 0, y: 0 },
      rafId: null,
      isLooking: false,
      anim: {
        purpleSkew: 0,
        blackSkew: 0,
        orangeSkew: 0,
        yellowSkew: 0,
        purpleX: 0,
        blackX: 0,
        purpleHeight: 400,
        purpleFaceLeft: 45,
        purpleFaceTop: 40,
        blackFaceLeft: 26,
        blackFaceTop: 32,
        orangeFaceX: 0,
        orangeFaceY: 0,
        yellowFaceX: 0,
        yellowFaceY: 0,
        mouthX: 0,
        mouthY: 0
      },
      purpleBlinkTimer: null,
      blackBlinkTimer: null,
      purplePeekTimer: null,
      lookingTimer: null,
      resizeObserver: null
    }
  },
  computed: {
    isAccountFocus () {
      return this.focusField === 'account'
    },
    isHidingPassword () {
      return this.passwordLength > 0 && !this.passwordVisible && this.focusField === 'password'
    },
    isShowingPassword () {
      return this.passwordLength > 0 && this.passwordVisible
    },
    stageStyle () {
      return {
        transform: `scale(${this.scale})`
      }
    },
    purpleBodyStyle () {
      return {
        transform: `skewX(${this.anim.purpleSkew}deg) translateX(${this.anim.purpleX}px)`,
        height: `${this.anim.purpleHeight}px`
      }
    },
    blackBodyStyle () {
      return {
        transform: `skewX(${this.anim.blackSkew}deg) translateX(${this.anim.blackX}px)`
      }
    },
    orangeBodyStyle () {
      return {
        transform: `skewX(${this.anim.orangeSkew}deg)`
      }
    },
    yellowBodyStyle () {
      return {
        transform: `skewX(${this.anim.yellowSkew}deg)`
      }
    },
    purpleFaceStyle () {
      return {
        left: `${this.anim.purpleFaceLeft}px`,
        top: `${this.anim.purpleFaceTop}px`
      }
    },
    blackFaceStyle () {
      return {
        left: `${this.anim.blackFaceLeft}px`,
        top: `${this.anim.blackFaceTop}px`
      }
    },
    orangeFaceStyle () {
      return {
        transform: `translate(${this.anim.orangeFaceX}px, ${this.anim.orangeFaceY}px)`
      }
    },
    yellowFaceStyle () {
      return {
        transform: `translate(${this.anim.yellowFaceX}px, ${this.anim.yellowFaceY}px)`
      }
    },
    yellowMouthStyle () {
      return {
        transform: `translate(${this.anim.mouthX}px, ${this.anim.mouthY}px)`
      }
    }
  },
  watch: {
    lookTarget: {
      deep: true,
      handler (val) {
        if (val && val.x != null) {
          this.mouse = { x: val.x, y: val.y }
        }
      }
    },
    isAccountFocus (val) {
      if (val && !this.isShowingPassword) {
        this.triggerLookAtEachOther()
      } else {
        this.clearLookingTimer()
        this.isLooking = false
      }
    },
    isShowingPassword (val) {
      if (val) {
        this.applyShowPassword(true)
        this.startPeekLoop()
      } else {
        this.stopPeekLoop()
        if (this.isHidingPassword) {
          this.applyHidingPassword(true)
        }
      }
    },
    isHidingPassword (val) {
      if (val && !this.isShowingPassword) {
        this.applyHidingPassword(true)
      }
    }
  },
  mounted () {
    this.updateScale()
    window.addEventListener('resize', this.updateScale)
    window.addEventListener('mousemove', this.onMouseMove, { passive: true })
    this.rafId = requestAnimationFrame(this.tick)
    this.$nextTick(() => {
      this.observeStageResize()
      this.schedulePurpleBlink()
      this.scheduleBlackBlink()
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.updateScale)
    window.removeEventListener('mousemove', this.onMouseMove)
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.clearLookingTimer()
    this.stopPeekLoop()
    clearTimeout(this.purpleBlinkTimer)
    clearTimeout(this.blackBlinkTimer)
  },
  methods: {
    eyeballStyle (size) {
      return {
        width: `${size}px`,
        height: `${size}px`
      }
    },
    eyeballPupilStyle (size) {
      return {
        width: `${size}px`,
        height: `${size}px`
      }
    },
    pupilStyle (size) {
      return {
        width: `${size}px`,
        height: `${size}px`
      }
    },
    updateScale () {
      const stage = this.$el && this.$el.querySelector('.login-scene__stage')
      if (!stage) return
      const rect = stage.getBoundingClientRect()
      if (!rect.width) return
      const scaleW = (rect.width - 48) / DESIGN_WIDTH
      const scaleH = (rect.height - 48) / DESIGN_HEIGHT
      this.scale = clamp(Math.min(scaleW, scaleH, 1.2), 0.55, 1.2)
    },
    observeStageResize () {
      const stage = this.$el && this.$el.querySelector('.login-scene__stage')
      if (!stage || typeof ResizeObserver === 'undefined') {
        this.updateScale()
        return
      }
      this.resizeObserver = new ResizeObserver(() => {
        this.updateScale()
      })
      this.resizeObserver.observe(stage)
      this.updateScale()
    },
    onMouseMove (e) {
      if (this.lookTarget && this.lookTarget.x != null) {
        this.mouse = { x: this.lookTarget.x, y: this.lookTarget.y }
      } else {
        this.mouse = { x: e.clientX, y: e.clientY }
      }
    },
    getElRect (refName) {
      const el = this.$refs[refName]
      return el ? el.getBoundingClientRect() : null
    },
    calcPos (el) {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 3
      const dx = this.mouse.x - cx
      const dy = this.mouse.y - cy
      return {
        faceX: clamp(dx / 20, -15, 15),
        faceY: clamp(dy / 30, -10, 10),
        bodySkew: clamp(-dx / 120, -6, 6)
      }
    },
    calcEyePos (el, maxDist) {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = this.mouse.x - cx
      const dy = this.mouse.y - cy
      const dist = Math.min(Math.hypot(dx, dy), maxDist)
      const angle = Math.atan2(dy, dx)
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist
      }
    },
    setPupilTransform (el, x, y) {
      el.style.transform = `translate(${x}px, ${y}px)`
    },
    lerpAnim (key, target, dt, duration = 0.3) {
      const alpha = smoothAlpha(dt, duration)
      this.anim[key] = lerp(this.anim[key], target, alpha)
    },
    applyLookAtEachOther (instant) {
      this.isLooking = true
      if (instant) {
        Object.assign(this.anim, {
          purpleFaceLeft: 55,
          purpleFaceTop: 65,
          blackFaceLeft: 32,
          blackFaceTop: 12
        })
      } else {
        this.anim.purpleFaceLeft = 55
        this.anim.purpleFaceTop = 65
        this.anim.blackFaceLeft = 32
        this.anim.blackFaceTop = 12
      }
      this.$nextTick(() => {
        const container = this.$refs.container
        if (!container) return
        container.querySelectorAll('.character--purple .eyeball__pupil').forEach(el => {
          this.setPupilTransform(el, 3, 4)
        })
        container.querySelectorAll('.character--black .eyeball__pupil').forEach(el => {
          this.setPupilTransform(el, 0, -4)
        })
      })
    },
    applyHidingPassword (instant) {
      if (instant) this.anim.purpleFaceLeft = 55
      else this.lerpAnim('purpleFaceLeft', 55, 0.016, 0.3)
      this.anim.purpleFaceTop = 65
    },
    applyShowPassword (instant) {
      const targets = {
        purpleSkew: 0,
        blackSkew: 0,
        orangeSkew: 0,
        yellowSkew: 0,
        purpleX: 0,
        blackX: 0,
        purpleHeight: 400,
        purpleFaceLeft: 20,
        purpleFaceTop: 35,
        blackFaceLeft: 10,
        blackFaceTop: 28,
        orangeFaceX: -32,
        orangeFaceY: -5,
        yellowFaceX: -32,
        yellowFaceY: -5,
        mouthX: -30,
        mouthY: 0
      }
      if (instant) Object.assign(this.anim, targets)
      else Object.keys(targets).forEach(k => { this.anim[k] = targets[k] })

      this.$nextTick(() => {
        const container = this.$refs.container
        if (!container) return
        container.querySelectorAll('.character--purple .eyeball__pupil, .character--black .eyeball__pupil').forEach(el => {
          this.setPupilTransform(el, -4, -4)
        })
        container.querySelectorAll('.character--orange .pupil, .character--yellow .pupil').forEach(el => {
          this.setPupilTransform(el, -5, -4)
        })
      })
    },
    triggerLookAtEachOther () {
      this.applyLookAtEachOther(false)
      this.clearLookingTimer()
      this.lookingTimer = setTimeout(() => {
        this.isLooking = false
      }, 800)
    },
    clearLookingTimer () {
      if (this.lookingTimer) {
        clearTimeout(this.lookingTimer)
        this.lookingTimer = null
      }
    },
    schedulePurpleBlink () {
      this.purpleBlinkTimer = setTimeout(() => {
        this.blinkEyeballs(this.$refs.purple, 18)
        this.schedulePurpleBlink()
      }, Math.random() * 4000 + 3000)
    },
    scheduleBlackBlink () {
      this.blackBlinkTimer = setTimeout(() => {
        this.blinkEyeballs(this.$refs.black, 16)
        this.scheduleBlackBlink()
      }, Math.random() * 4000 + 3000)
    },
    blinkEyeballs (characterEl, size) {
      if (!characterEl || this.isShowingPassword) return
      const eyeballs = characterEl.querySelectorAll('.eyeball')
      eyeballs.forEach(el => {
        el.style.height = '2px'
      })
      setTimeout(() => {
        eyeballs.forEach(el => {
          el.style.height = `${size}px`
        })
      }, 150)
    },
    startPeekLoop () {
      this.stopPeekLoop()
      const loop = () => {
        this.purplePeekTimer = setTimeout(() => {
          const container = this.$refs.container
          if (!container || !this.isShowingPassword) return
          container.querySelectorAll('.character--purple .eyeball__pupil').forEach(el => {
            this.setPupilTransform(el, 4, 5)
          })
          this.anim.purpleFaceLeft = 20
          this.anim.purpleFaceTop = 35
          setTimeout(() => {
            if (!this.isShowingPassword) return
            container.querySelectorAll('.character--purple .eyeball__pupil').forEach(el => {
              this.setPupilTransform(el, -4, -4)
            })
            loop()
          }, 800)
        }, Math.random() * 3000 + 2000)
      }
      loop()
    },
    stopPeekLoop () {
      if (this.purplePeekTimer) {
        clearTimeout(this.purplePeekTimer)
        this.purplePeekTimer = null
      }
    },
    tick (timestamp) {
      if (!this._lastTs) this._lastTs = timestamp
      const dt = Math.min((timestamp - this._lastTs) / 1000, 0.05)
      this._lastTs = timestamp

      const purple = this.$refs.purple
      const black = this.$refs.black
      const orange = this.$refs.orange
      const yellow = this.$refs.yellow
      const container = this.$refs.container
      const showing = this.isShowingPassword
      const typing = this.isAccountFocus
      const hiding = this.isHidingPassword
      const looking = this.isLooking

      if (purple && !showing) {
        const pp = this.calcPos(purple)
        if (typing || hiding) {
          this.lerpAnim('purpleSkew', pp.bodySkew - 12, dt)
          this.lerpAnim('purpleX', 40, dt)
          this.lerpAnim('purpleHeight', 440, dt)
        } else {
          this.lerpAnim('purpleSkew', pp.bodySkew, dt)
          this.lerpAnim('purpleX', 0, dt)
          this.lerpAnim('purpleHeight', 400, dt)
        }
      }

      if (black && !showing) {
        const bp = this.calcPos(black)
        if (looking) {
          this.lerpAnim('blackSkew', bp.bodySkew * 1.5 + 10, dt)
          this.lerpAnim('blackX', 20, dt)
        } else if (typing || hiding) {
          this.lerpAnim('blackSkew', bp.bodySkew * 1.5, dt)
          this.lerpAnim('blackX', 0, dt)
        } else {
          this.lerpAnim('blackSkew', bp.bodySkew, dt)
          this.lerpAnim('blackX', 0, dt)
        }
      }

      if (orange && !showing) {
        const op = this.calcPos(orange)
        this.lerpAnim('orangeSkew', op.bodySkew, dt)
      }

      if (yellow && !showing) {
        const yp = this.calcPos(yellow)
        this.lerpAnim('yellowSkew', yp.bodySkew, dt)
      }

      if (purple && !showing && !looking) {
        const pp = this.calcPos(purple)
        const purpleFaceX = pp.faceX >= 0 ? Math.min(25, pp.faceX * 1.5) : pp.faceX
        this.lerpAnim('purpleFaceLeft', 45 + purpleFaceX, dt, 0.3)
        this.lerpAnim('purpleFaceTop', 40 + pp.faceY, dt, 0.3)
      }

      if (black && !showing && !looking) {
        const bp = this.calcPos(black)
        this.lerpAnim('blackFaceLeft', 26 + bp.faceX, dt, 0.3)
        this.lerpAnim('blackFaceTop', 32 + bp.faceY, dt, 0.3)
      }

      if (orange && !showing) {
        const op = this.calcPos(orange)
        this.lerpAnim('orangeFaceX', op.faceX, dt, 0.2)
        this.lerpAnim('orangeFaceY', op.faceY, dt, 0.2)
      }

      if (yellow && !showing) {
        const yp = this.calcPos(yellow)
        this.lerpAnim('yellowFaceX', yp.faceX, dt, 0.2)
        this.lerpAnim('yellowFaceY', yp.faceY, dt, 0.2)
        this.lerpAnim('mouthX', yp.faceX, dt, 0.2)
        this.lerpAnim('mouthY', yp.faceY, dt, 0.2)
      }

      if (!showing && container) {
        container.querySelectorAll('.pupil').forEach(el => {
          const maxDist = Number(el.dataset.maxDistance) || 5
          const pos = this.calcEyePos(el, maxDist)
          this.setPupilTransform(el, pos.x, pos.y)
        })

        if (!looking) {
          container.querySelectorAll('.eyeball').forEach(el => {
            const maxDist = Number(el.dataset.maxDistance) || 10
            const pupil = el.querySelector('.eyeball__pupil')
            if (!pupil) return
            const pos = this.calcEyePos(el, maxDist)
            this.setPupilTransform(pupil, pos.x, pos.y)
          })
        }
      }

      this.rafId = requestAnimationFrame(this.tick)
    }
  }
}
</script>

<style lang="less" scoped>
.login-scene {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: transparent;

  &__stage {
    position: relative;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    transform: translateY(-6%);
  }

  &__characters {
    position: relative;
    width: 550px;
    height: 400px;
    transform-origin: center center;
    will-change: transform;
  }
}

.character {
  position: absolute;
  bottom: 0;
  transform-origin: bottom center;
  will-change: transform;

  &--purple {
    left: 70px;
    width: 180px;
    height: 400px;
    background: #6c3ff5;
    border-radius: 10px 10px 0 0;
    z-index: 1;
  }

  &--black {
    left: 240px;
    width: 120px;
    height: 310px;
    background: #2d2d2d;
    border-radius: 8px 8px 0 0;
    z-index: 2;
  }

  &--orange {
    left: 0;
    width: 240px;
    height: 200px;
    background: #ff9b6b;
    border-radius: 120px 120px 0 0;
    z-index: 3;
  }

  &--yellow {
    left: 310px;
    width: 140px;
    height: 230px;
    background: #e8d754;
    border-radius: 70px 70px 0 0;
    z-index: 4;
  }

  &__face {
    position: absolute;
    display: flex;
    gap: 32px;

    &--black {
      gap: 24px;
    }

    &--orange {
      left: 82px;
      top: 90px;
      gap: 32px;
    }

    &--yellow {
      left: 52px;
      top: 40px;
      gap: 24px;
    }
  }

  &__mouth {
    position: absolute;
    width: 80px;
    height: 4px;
    background: #2d2d2d;
    border-radius: 9999px;
    left: 40px;
    top: 88px;
    will-change: transform;
  }
}

.eyeball {
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  will-change: height, transform;

  &__pupil {
    border-radius: 50%;
    background: #2d2d2d;
    will-change: transform;
  }
}

.pupil {
  border-radius: 50%;
  background: #2d2d2d;
  will-change: transform;
}
</style>
