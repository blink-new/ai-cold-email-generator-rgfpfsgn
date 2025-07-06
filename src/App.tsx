import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, Sparkles, User, Target, Copy, Check, RefreshCw, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import blink from './blink/client'

interface EmailData {
  recipientName: string
  recipientCompany: string
  recipientRole: string
  recipientIndustry: string
  senderName: string
  senderCompany: string
  senderRole: string
  purpose: string
  tone: string
  additionalInfo: string
}

const initialEmailData: EmailData = {
  recipientName: '',
  recipientCompany: '',
  recipientRole: '',
  recipientIndustry: '',
  senderName: '',
  senderCompany: '',
  senderRole: '',
  purpose: '',
  tone: 'professional',
  additionalInfo: ''
}

function App() {
  const [user, setUser] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [emailData, setEmailData] = useState<EmailData>(initialEmailData)
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showTips, setShowTips] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  const handleInputChange = (field: keyof EmailData, value: string) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const canGenerate = emailData.recipientName && emailData.recipientCompany && emailData.purpose

  const generateEmail = async () => {
    if (!canGenerate) {
      toast.error('Please fill in recipient name, company, and purpose')
      return
    }
    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedEmail('')

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // Use web search for research
      const prompt = `You are an expert cold email copywriter. Research the recipient's company and industry using web search. Write a highly personalized cold email for the following scenario:

Recipient:
- Name: ${emailData.recipientName}
- Company: ${emailData.recipientCompany}
- Role: ${emailData.recipientRole}
- Industry: ${emailData.recipientIndustry}

Sender:
- Name: ${emailData.senderName}
- Company: ${emailData.senderCompany}
- Role: ${emailData.senderRole}

Purpose: ${emailData.purpose}
Tone: ${emailData.tone}
Additional Info: ${emailData.additionalInfo}

Guidelines:
- Use web search to find recent news, achievements, or pain points about the recipient's company/industry.
- Start with a personalized hook referencing your research.
- Clearly state the value proposition and why it's relevant now.
- Include a specific, low-friction call-to-action.
- Keep it concise (max 200 words), human, and non-generic.
- Format as:
Subject: [Compelling subject line]

[Email body]

Best regards,\n${emailData.senderName}${emailData.senderCompany ? `\n${emailData.senderCompany}` : ''}${emailData.senderRole ? `\n${emailData.senderRole}` : ''}`

      const { text } = await blink.ai.generateText({
        prompt,
        model: 'gpt-4o-mini',
        maxTokens: 500,
        search: true // Use web search for research
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)
      setGeneratedEmail(text)
      toast.success('Email generated!')
    } catch {
      toast.error('Failed to generate email. Please try again.')
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail)
      setCopied(true)
      toast.success('Email copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy email')
    }
  }

  const handleRegenerate = () => {
    generateEmail()
  }

  const handleReset = () => {
    setEmailData(initialEmailData)
    setGeneratedEmail('')
    setGenerationProgress(0)
    setCopied(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center py-6 px-2">
      {/* Header */}
      <header className="w-full max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Cold Email Generator
              </h1>
              <p className="text-xs text-gray-500">Personalized, research-driven cold emails</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Sparkles className="h-3 w-3 mr-1" />AI
            </Badge>
            <Button variant="ghost" size="icon" aria-label="Show tips" onClick={() => setShowTips(v => !v)}>
              <Info className="h-5 w-5 text-blue-500" />
            </Button>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        {/* Tips (collapsible) */}
        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-2"
            >
              <Card className="bg-blue-50/80 border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Info className="h-4 w-4" /> Tips for Better Cold Emails
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-900 space-y-2">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Reference recent news or achievements about the recipient's company.</li>
                    <li>Keep your message concise and focused on value.</li>
                    <li>Personalize your opening line—avoid generic intros.</li>
                    <li>End with a clear, low-friction call-to-action.</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form + Output */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* Input Form */}
          <Card className="flex-1 min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Fill in Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                  <Input id="recipientName" value={emailData.recipientName} onChange={e => handleInputChange('recipientName', e.target.value)} placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="recipientCompany">Recipient Company *</Label>
                  <Input id="recipientCompany" value={emailData.recipientCompany} onChange={e => handleInputChange('recipientCompany', e.target.value)} placeholder="Acme Corp" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="recipientRole">Recipient Role</Label>
                  <Input id="recipientRole" value={emailData.recipientRole} onChange={e => handleInputChange('recipientRole', e.target.value)} placeholder="CEO, CTO, etc." />
                </div>
                <div>
                  <Label htmlFor="recipientIndustry">Industry</Label>
                  <Input id="recipientIndustry" value={emailData.recipientIndustry} onChange={e => handleInputChange('recipientIndustry', e.target.value)} placeholder="Tech, Healthcare, etc." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="senderName">Your Name</Label>
                  <Input id="senderName" value={emailData.senderName} onChange={e => handleInputChange('senderName', e.target.value)} placeholder="Jane Smith" />
                </div>
                <div>
                  <Label htmlFor="senderCompany">Your Company</Label>
                  <Input id="senderCompany" value={emailData.senderCompany} onChange={e => handleInputChange('senderCompany', e.target.value)} placeholder="Your Company Inc." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="senderRole">Your Role</Label>
                  <Input id="senderRole" value={emailData.senderRole} onChange={e => handleInputChange('senderRole', e.target.value)} placeholder="Sales Director" />
                </div>
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={emailData.tone} onValueChange={value => handleInputChange('tone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="purpose">Purpose *</Label>
                <Textarea id="purpose" value={emailData.purpose} onChange={e => handleInputChange('purpose', e.target.value)} placeholder="I want to schedule a demo of our new platform..." rows={2} />
              </div>
              <div>
                <Label htmlFor="additionalInfo">Additional Info</Label>
                <Textarea id="additionalInfo" value={emailData.additionalInfo} onChange={e => handleInputChange('additionalInfo', e.target.value)} placeholder="Recent news, mutual connections, etc." rows={2} />
              </div>
              <div className="flex gap-2 mt-2">
                <Button onClick={generateEmail} disabled={isGenerating || !canGenerate} className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg">
                  {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  {isGenerating ? 'Generating...' : 'Generate Email'}
                </Button>
                <Button onClick={handleReset} variant="outline" className="h-11">Reset</Button>
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="flex-1 min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Generated Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isGenerating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Researching and writing your email...</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div style={{ width: `${generationProgress}%` }} className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 transition-all" />
                    </div>
                  </motion.div>
                )}
                {generatedEmail && !isGenerating && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-800 font-mono whitespace-pre-wrap">
                      {generatedEmail}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={copyToClipboard} variant="outline" size="sm" className="flex items-center gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button onClick={handleRegenerate} variant="ghost" size="sm" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                  </motion.div>
                )}
                {!generatedEmail && !isGenerating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-gray-400">
                    <Sparkles className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-sm">Your AI-powered cold email will appear here.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default App
