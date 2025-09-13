import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { apiPost, ORIGIN } from '../config/api.js'
import { useAuth } from '../context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFonts } from 'expo-font'

const FONT = 'DungGeunMo'

export default function GoalScreen({ navigation }) {
  const { markGoalDone } = useAuth()
  const [targetWeight, setTargetWeight] = useState('')
  const [targetCalories, setTargetCalories] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('F')
  const [saving, setSaving] = useState(false)

  const [fontsLoaded] = useFonts({
    [FONT]: require('../../assets/fonts/DungGeunMo.otf'),
  })
  if (!fontsLoaded) return null

  useEffect(() => {
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem('goal_draft')
        if (!raw) return
        const d = JSON.parse(raw)
        if (d?.weight != null) setWeight(String(d.weight))
        if (d?.height != null) setHeight(String(d.height))
        if (d?.age != null) setAge(String(d.age))
        if (d?.gender) setGender(d.gender === 'M' ? 'M' : 'F')
      } catch (e) {
        if (__DEV__) console.warn('goal_draft load fail:', e)
      }
    })()
  }, [])

  const submit = async () => {
    if (saving) return
    if (!weight || !height) {
      Alert.alert('입력 필요', '현재 체중과 키는 필수입니다.')
      return
    }
    try {
      setSaving(true)
      if (__DEV__) console.log('POST to:', ORIGIN + '/body')
      const payload = {
        targetWeight: targetWeight ? Number(targetWeight) : null,
        targetCalories: targetCalories ? Number(targetCalories) : null,
        weight: Number(weight),
        height: Number(height),
        age: age ? Number(age) : null,
        gender,
      }
      await apiPost('/body', payload)
      await AsyncStorage.removeItem('goal_draft')
      await markGoalDone()
      navigation.replace('Home')
    } catch (e) {
      Alert.alert('네트워크 오류', String(e?.message ?? e))
    } finally {
      setSaving(false)
    }
  }

  const skip = async () => {
    await AsyncStorage.removeItem('goal_draft')
    await markGoalDone()
    navigation.replace('Home')
  }

  const inputStyle = {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontFamily: FONT,
  }

  const labelStyle = {
    fontFamily: FONT,
    marginBottom: 4,
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, padding: 24, gap: 14, justifyContent: 'center' }}>
        <Text style={{ fontSize: 26, textAlign: 'center', fontFamily: FONT, marginBottom: 12 }}>목표 설정</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>현재 체중(kg)</Text>
            <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={inputStyle} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>키(cm)</Text>
            <TextInput value={height} onChangeText={setHeight} keyboardType="numeric" style={inputStyle} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>목표 체중(kg)</Text>
            <TextInput value={targetWeight} onChangeText={setTargetWeight} keyboardType="numeric" style={inputStyle} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>목표 섭취칼로리(kcal)</Text>
            <TextInput value={targetCalories} onChangeText={setTargetCalories} keyboardType="numeric" style={inputStyle} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>나이</Text>
            <TextInput value={age} onChangeText={setAge} keyboardType="numeric" style={inputStyle} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>성별</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setGender('F')}
                style={{
                  flex: 1,
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 8,
                  backgroundColor: gender === 'F' ? '#fecaca' : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: FONT }}>F</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGender('M')}
                style={{
                  flex: 1,
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 8,
                  backgroundColor: gender === 'M' ? '#bfdbfe' : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: FONT }}>M</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={submit}
          disabled={saving}
          style={{ backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 }}
        >
          <Text style={{ color: 'white', fontFamily: FONT }}>{saving ? '저장 중...' : '저장하고 시작하기'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={skip} style={{ alignItems: 'center', padding: 10 }}>
          <Text style={{ fontFamily: FONT }}>나중에 설정</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
