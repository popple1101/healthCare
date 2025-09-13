import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: W, height: H } = Dimensions.get('window')
const GAME_SEC = 45
const ITEM_SIZE = 40
const SPAWN_MS = 950
const BASKET_W = 112
const BASKET_H = 40
const SPEED_MIN = 90
const SPEED_MAX = 150
const MAX_ITEMS = 30
const UI_FPS_MS = 33
const TAP_STEP = 12
const HOLD_SPEED = 140
const EASE_MS = 600

const FOOD = [
  { emoji:'🥗', good:true },
  { emoji:'🍎', good:true },
  { emoji:'🥕', good:true },
  { emoji:'🍅', good:true },
  { emoji:'🍩', good:false },
  { emoji:'🍟', good:false },
  { emoji:'🥤', good:false },
]

export default function HealthyCatchGameScreen({ navigation }) {
  const insets = useSafeAreaInsets()
  const hitY = useMemo(() => Math.min(H * 0.72, H - insets.bottom - 220), [insets.bottom])

  const [timeLeft, setTimeLeft] = useState(GAME_SEC)
  const [score, setScore] = useState(0)
  const [miss, setMiss] = useState(0)
  const [over, setOver] = useState(false)
  const [uiTick, setUiTick] = useState(0)
  const [combo, setCombo] = useState(0)
  const [comboBlink, setComboBlink] = useState(false)

  const scoreRef = useRef(0)
  const missRef = useRef(0)
  const comboRef = useRef(0)

  const itemsRef = useRef([])
  const basketXRef = useRef(W * 0.5)

  const rafId = useRef(null)
  const uiId = useRef(null)
  const spawnId = useRef(null)
  const timerId = useRef(null)
  const lastTs = useRef(0)
  const holdId = useRef(null)

  useEffect(() => {
    timerId.current = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { clearInterval(timerId.current); endGame(); return 0 }
        return s - 1
      })
    }, 1000)
    spawnId.current = setInterval(spawn, SPAWN_MS)
    lastTs.current = Date.now()
    rafId.current = requestAnimationFrame(loop)
    uiId.current = setInterval(() => setUiTick((t) => t + 1), UI_FPS_MS)
    return () => {
      clearInterval(timerId.current)
      clearInterval(spawnId.current)
      clearInterval(uiId.current)
      cancelAnimationFrame(rafId.current)
      if (holdId.current) cancelAnimationFrame(holdId.current)
    }
  }, [])

  function spawn() {
    if (over) return
    if (itemsRef.current.length > MAX_ITEMS) return
    const goodList = FOOD.filter(f=>f.good)
    const badList = FOOD.filter(f=>!f.good)
    const type = Math.random() < 0.7 ? goodList[Math.floor(Math.random()*goodList.length)] : badList[Math.floor(Math.random()*badList.length)]
    const x = Math.random() * (W - ITEM_SIZE - 24) + 12
    const vy = SPEED_MIN + Math.random()*(SPEED_MAX - SPEED_MIN)
    const now = Date.now()
    const it = { id: `${now}_${Math.random()}`, x, y: -ITEM_SIZE, vy, emoji:type.emoji, good:type.good, caught:false, born: now }
    itemsRef.current = [...itemsRef.current, it]
  }

  function applyScore(goodCatch) {
    if (goodCatch) {
      const newCombo = comboRef.current + 1
      comboRef.current = newCombo
      const bonus = Math.min(3, Math.floor(newCombo / 5))
      scoreRef.current += 2 + bonus
      if (newCombo % 5 === 0) {
        setComboBlink(true)
        setTimeout(() => setComboBlink(false), 160)
      }
    } else {
      missRef.current += 1
      comboRef.current = 0
    }
  }

  function syncUi() {
    if (score !== scoreRef.current) setScore(scoreRef.current)
    if (miss !== missRef.current) setMiss(missRef.current)
    if (combo !== comboRef.current) setCombo(comboRef.current)
  }

  function loop() {
    const now = Date.now()
    const dt = Math.min(0.03, (now - lastTs.current) / 1000)
    lastTs.current = now

    const by = hitY
    const bw = BASKET_W
    const bh = BASKET_H
    const bx = basketXRef.current - bw/2

    const rm = new Set()
    for (let i=0;i<itemsRef.current.length;i++) {
      const it = itemsRef.current[i]
      const age = now - it.born
      const ease = Math.min(1, age / EASE_MS)
      it.y += it.vy * dt * ease

      const ix = it.x
      const iy = it.y
      const collY = iy + ITEM_SIZE >= by && iy <= by + bh
      const collX = ix + ITEM_SIZE >= bx && ix <= bx + bw

      if (!it.caught && collY && collX) {
        it.caught = true
        rm.add(it.id)
        applyScore(it.good)
      }
      if (iy > H) {
        rm.add(it.id)
        if (it.good) applyScore(false)
      }
    }

    if (rm.size) {
      itemsRef.current = itemsRef.current.filter(it => !rm.has(it.id))
      if (missRef.current >= 10) endGame()
    }

    syncUi()
    if (!over) rafId.current = requestAnimationFrame(loop)
  }

  function endGame() {
    if (over) return
    clearInterval(timerId.current)
    clearInterval(spawnId.current)
    clearInterval(uiId.current)
    cancelAnimationFrame(rafId.current)
    if (holdId.current) cancelAnimationFrame(holdId.current)
    setOver(true)
  }

  function move(dx) {
    basketXRef.current = Math.max(BASKET_W/2, Math.min(W - BASKET_W/2, basketXRef.current + dx))
  }

  function holdMove(dir) {
    let last = Date.now()
    const step = () => {
      const now = Date.now()
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      move(dir * HOLD_SPEED * dt)
      if (!over) holdId.current = requestAnimationFrame(step)
    }
    holdId.current = requestAnimationFrame(step)
  }

  function stopHold() {
    if (holdId.current) {
      cancelAnimationFrame(holdId.current)
      holdId.current = null
    }
  }

  function retry() {
    itemsRef.current = []
    basketXRef.current = W*0.5
    scoreRef.current = 0
    missRef.current = 0
    comboRef.current = 0
    setScore(0)
    setMiss(0)
    setCombo(0)
    setTimeLeft(GAME_SEC)
    setOver(false)
    clearInterval(timerId.current)
    clearInterval(spawnId.current)
    clearInterval(uiId.current)
    cancelAnimationFrame(rafId.current)
    timerId.current = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { clearInterval(timerId.current); endGame(); return 0 }
        return s - 1
      })
    }, 1000)
    spawnId.current = setInterval(spawn, SPAWN_MS)
    uiId.current = setInterval(() => setUiTick(t => t + 1), UI_FPS_MS)
    lastTs.current = Date.now()
    rafId.current = requestAnimationFrame(loop)
  }

  const snapshot = itemsRef.current

  return (
    <View style={{ flex:1, backgroundColor:'#071018', paddingTop: insets.top + 10 }}>
      <View style={{ alignItems:'center', marginBottom:6 }}>
        <Text style={{ fontFamily:'DungGeunMo', fontSize:22, color:'#8fd4ff', letterSpacing:1 }}>SALAD CATCH</Text>
      </View>

      <View style={{ marginHorizontal:14, paddingVertical:8, paddingHorizontal:12, borderRadius:14, backgroundColor:'rgba(15,28,44,0.65)', borderWidth:1, borderColor:'#2b4a68', flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
          <Text style={{ fontFamily:'DungGeunMo', color:'#c7f9cc', fontSize:16 }}>SCORE {score}</Text>
          <Text style={{ fontFamily:'DungGeunMo', color:'#ffd166', fontSize:16 }}>TIME {timeLeft}s</Text>
          <Text style={{ fontFamily:'DungGeunMo', color:'#ff6b6b', fontSize:16 }}>MISS {miss}/10</Text>
        </View>
        <View style={{ paddingHorizontal:10, paddingVertical:4, borderRadius:10, backgroundColor: comboBlink ? 'rgba(199,249,204,0.35)' : 'rgba(15,40,25,0.55)', borderWidth:1, borderColor:'#3d7a5c', minWidth:72, alignItems:'center' }}>
          <Text style={{ fontFamily:'DungGeunMo', color:'#a7f3d0', fontSize:14 }}>COMBO x{combo}</Text>
        </View>
      </View>

      <View style={{ flex:1 }} pointerEvents="box-none">
        {snapshot.map(it => (
          <Text
            key={it.id}
            pointerEvents="none"
            style={{
              position:'absolute',
              left: it.x,
              transform:[{ translateY: it.y }],
              fontSize:28,
            }}
          >
            {it.emoji}
          </Text>
        ))}

        <View
          pointerEvents="none"
          style={{
            position:'absolute',
            left: basketXRef.current - BASKET_W/2,
            top: hitY,
            width: BASKET_W,
            height: BASKET_H,
            borderRadius:12,
            alignItems:'center',
            justifyContent:'center',
            borderWidth:2,
            borderColor:'#7aa0b8',
            backgroundColor:'rgba(31,59,87,0.35)',
          }}
        >
          <Text style={{ fontSize:18, color:'#c7f9cc' }}>🧺</Text>
        </View>
      </View>

      <View style={{ flexDirection:'row', gap:10, padding:14, paddingBottom: insets.bottom + 12 }}>
        <Pressable
          onPress={()=>move(-TAP_STEP)}
          onPressIn={()=>holdMove(-1)}
          onPressOut={stopHold}
          style={{ flex:1, paddingVertical:16, backgroundColor:'rgba(19,78,74,0.85)', borderRadius:14, alignItems:'center', borderWidth:1, borderColor:'#2d6b66' }}
        >
          <Text style={{ fontFamily:'DungGeunMo', fontSize:18, color:'#a7f3d0' }}>LEFT</Text>
        </Pressable>
        <Pressable
          onPress={()=>move(TAP_STEP)}
          onPressIn={()=>holdMove(1)}
          onPressOut={stopHold}
          style={{ flex:1, paddingVertical:16, backgroundColor:'rgba(30,58,138,0.85)', borderRadius:14, alignItems:'center', borderWidth:1, borderColor:'#384c9b' }}
        >
          <Text style={{ fontFamily:'DungGeunMo', fontSize:18, color:'#bfdbfe' }}>RIGHT</Text>
        </Pressable>
      </View>

      {over && (
        <View style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.5)', alignItems:'center', justifyContent:'center', paddingHorizontal:24 }}>
          <View style={{ backgroundColor:'rgba(11,22,34,0.9)', borderColor:'#7aa0b8', borderWidth:2, borderRadius:16, padding:20, width: Math.min(340, W - 40) }}>
            <Text style={{ fontFamily:'DungGeunMo', fontSize:20, color:'#8fd4ff', textAlign:'center' }}>RESULT</Text>
            <Text style={{ fontFamily:'DungGeunMo', fontSize:18, color:'#c7f9cc', textAlign:'center', marginTop:10 }}>Score {score}</Text>
            <Text style={{ fontFamily:'DungGeunMo', fontSize:16, color:'#a7f3d0', textAlign:'center', marginTop:4 }}>Combo x{combo}</Text>
            <View style={{ flexDirection:'row', gap:10, marginTop:16 }}>
              <Pressable onPress={retry} style={{ flex:1, paddingVertical:12, backgroundColor:'#1f3b57', borderRadius:10, alignItems:'center' }}>
                <Text style={{ fontFamily:'DungGeunMo', fontSize:16, color:'#8fd4ff' }}>RETRY</Text>
              </Pressable>
              <Pressable onPress={() => navigation.goBack()} style={{ flex:1, paddingVertical:12, backgroundColor:'#184a2b', borderRadius:10, alignItems:'center' }}>
                <Text style={{ fontFamily:'DungGeunMo', fontSize:16, color:'#c7f9cc' }}>EXIT</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
