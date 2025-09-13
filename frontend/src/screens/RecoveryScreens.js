// >>> [ADDED] NEW FILE: src/screens/RecoveryScreens.js
import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { useI18n } from '../i18n/I18nContext'
import { apiPost } from '../config/api'
import { useFonts } from 'expo-font'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const FONT = 'DungGeunMo'
const Q = [
  { code: 'BIRTHPLACE', labelKey: 'QUESTION_BIRTHPLACE' },
  { code: 'ELEMENTARY_SCHOOL', labelKey: 'QUESTION_ELEMENTARY_SCHOOL' },
  { code: 'PET_NAME', labelKey: 'QUESTION_PET_NAME' },
  { code: 'MOTHER_NAME', labelKey: 'QUESTION_MOTHER_NAME' },
]

export function RecoverySetupScreen() {
  const [fontsLoaded] = useFonts({ [FONT]: require('../../assets/fonts/DungGeunMo.otf') })
  const { t } = useI18n()
  const insets = useSafeAreaInsets()
  const [answers, setAnswers] = useState([
    { code: 'BIRTHPLACE', answer: '', confirm: '' },
    { code: 'ELEMENTARY_SCHOOL', answer: '', confirm: '' },
    { code: 'PET_NAME', answer: '', confirm: '' },
  ])
  if (!fontsLoaded) return null

  const update = (idx, key, val) => {
    setAnswers(a => a.map((x,i) => i===idx ? { ...x, [key]: val } : x))
  }

  const submit = async () => {
    try {
      if (answers.length < 3) return Alert.alert(t('RECOVERY_SETUP'), t('INPUT_REQUIRED'))
      for (const a of answers) {
        if (!a.code || !a.answer || !a.confirm) return Alert.alert(t('RECOVERY_SETUP'), t('INPUT_REQUIRED'))
        if (a.answer !== a.confirm) return Alert.alert(t('RECOVERY_SETUP'), t('TRY_AGAIN'))
      }
      await apiPost('/api/recover/register', { answers })
      Alert.alert(t('RECOVERY_SETUP'), t('EDIT_DONE'))
    } catch (e) {
      Alert.alert(t('RECOVERY_SETUP'), e?.message ?? t('TRY_AGAIN'))
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 80, padding: 16, gap: 12 }}>
      <Text style={{ fontFamily: FONT, fontSize: 26, textAlign: 'center' }}>{t('RECOVERY_SETUP')}</Text>
      <Text style={{ fontFamily: FONT, color: '#333', textAlign: 'center', marginBottom: 8 }}>{t('RECOVERY_REGISTER_DESC')}</Text>

      {answers.map((row, idx) => (
        <View key={idx} style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, gap: 8, backgroundColor: 'rgba(255,255,255,0.9)' }}>
          <Text style={{ fontFamily: FONT }}>{t(Q.find(q=>q.code===row.code)?.labelKey || row.code)}</Text>
          <TextInput value={row.answer} onChangeText={v=>update(idx,'answer',v)} placeholder={t('ANSWER')} style={{ borderWidth: 1, borderRadius: 8, padding: 10, fontFamily: FONT }} />
          <TextInput value={row.confirm} onChangeText={v=>update(idx,'confirm',v)} placeholder={t('ANSWER_CONFIRM')} style={{ borderWidth: 1, borderRadius: 8, padding: 10, fontFamily: FONT }} />
        </View>
      ))}

      <TouchableOpacity onPress={submit} style={{ backgroundColor: '#111827', padding: 14, borderRadius: 12 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontFamily: FONT }}>{t('CONFIRM')}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export function RecoveryFlowScreen() {
  const [fontsLoaded] = useFonts({ [FONT]: require('../../assets/fonts/DungGeunMo.otf') })
  const { t } = useI18n()
  const insets = useSafeAreaInsets()
  const [stage, setStage] = useState('start') // start -> answer -> reset
  const [id, setId] = useState('')
  const [codes, setCodes] = useState([])
  const [a1, setA1] = useState('')
  const [a2, setA2] = useState('')
  const [token, setToken] = useState('')
  const [newPw, setNewPw] = useState('')

  if (!fontsLoaded) return null

  const start = async () => {
    try {
      const res = await apiPost('/api/recover/start', { id })
      setCodes(res?.questionCodes || [])
      setStage('answer')
    } catch (e) {
      alert(e?.message ?? t('TRY_AGAIN'))
    }
  }
  const answer = async () => {
    try {
      const res = await apiPost('/api/recover/verify', {
        id,
        answers: [
          { code: codes[0], answer: a1 },
          { code: codes[1], answer: a2 },
        ]
      })
      setToken(res?.recoveryToken || '')
      setStage('reset')
    } catch (e) {
      alert(e?.message ?? t('TRY_AGAIN'))
    }
  }
  const resetPw = async () => {
    try {
      await apiPost('/api/recover/reset', { recoveryToken: token, newPassword: newPw })
      alert(t('EDIT_DONE'))
      setStage('start')
      setId(''); setCodes([]); setA1(''); setA2(''); setToken(''); setNewPw('')
    } catch (e) {
      alert(e?.message ?? t('TRY_AGAIN'))
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 80, padding: 16, gap: 12 }}>
      <Text style={{ fontFamily: FONT, fontSize: 26, textAlign: 'center' }}>{t('RECOVERY')}</Text>

      {stage === 'start' && (
        <>
          <Text style={{ fontFamily: FONT, textAlign: 'center' }}>{t('RECOVERY_START_DESC')}</Text>
          <TextInput value={id} onChangeText={setId} placeholder={t('RECOVERY_ID')} autoCapitalize="none"
            style={{ borderWidth: 1, borderRadius: 10, padding: 12, fontFamily: FONT }} />
          <TouchableOpacity onPress={start} style={{ backgroundColor: '#111827', padding: 14, borderRadius: 12 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontFamily: FONT }}>{t('RECOVERY_START')}</Text>
          </TouchableOpacity>
        </>
      )}

      {stage === 'answer' && (
        <>
          <Text style={{ fontFamily: FONT }}>{t(getLabel(codes[0]))}</Text>
          <TextInput value={a1} onChangeText={setA1} placeholder={t('ANSWER')}
            style={{ borderWidth: 1, borderRadius: 10, padding: 12, fontFamily: FONT }} />
          <Text style={{ fontFamily: FONT }}>{t(getLabel(codes[1]))}</Text>
          <TextInput value={a2} onChangeText={setA2} placeholder={t('ANSWER')}
            style={{ borderWidth: 1, borderRadius: 10, padding: 12, fontFamily: FONT }} />
          <TouchableOpacity onPress={answer} style={{ backgroundColor: '#111827', padding: 14, borderRadius: 12 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontFamily: FONT }}>{t('RECOVERY_ANSWER')}</Text>
          </TouchableOpacity>
        </>
      )}

      {stage === 'reset' && (
        <>
          <TextInput value={newPw} onChangeText={setNewPw} placeholder={t('RECOVERY_NEW_PW')} secureTextEntry
            style={{ borderWidth: 1, borderRadius: 10, padding: 12, fontFamily: FONT }} />
          <TouchableOpacity onPress={resetPw} style={{ backgroundColor: '#111827', padding: 14, borderRadius: 12 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontFamily: FONT }}>{t('RECOVERY_RESET')}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  )

  function getLabel(code) {
    switch (code) {
      case 'BIRTHPLACE': return 'QUESTION_BIRTHPLACE'
      case 'ELEMENTARY_SCHOOL': return 'QUESTION_ELEMENTARY_SCHOOL'
      case 'PET_NAME': return 'QUESTION_PET_NAME'
      case 'MOTHER_NAME': return 'QUESTION_MOTHER_NAME'
      default: return code
    }
  }
}
