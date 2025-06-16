"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Save, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { checkAuth } from "../actions/auth-service"
import { updateUserProfile } from "../actions/profile-actions"

// 基本資料表單驗證
const basicFormSchema = z.object({
  name: z.string().min(2, { message: "姓名至少需要 2 個字元" }),
  idNumber: z.string().regex(/^[A-Z][12]\d{8}$/, { message: "請輸入有效的身分證字號" }),
  birthdate: z.date({ required_error: "請選擇出生日期" }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "請選擇性別",
  }),
  phone: z.string().regex(/^09\d{8}$/, { message: "請輸入有效的手機號碼" }),
  email: z.string().email({ message: "請輸入有效的電子郵件" }).optional(),
  address: z.string().min(5, { message: "地址至少需要 5 個字元" }),
})

// 額外資訊表單驗證
const additionalFormSchema = z.object({
  emergencyContact: z.string().optional(),
  emergencyPhone: z
    .string()
    .regex(/^09\d{8}$/, { message: "請輸入有效的手機號碼" })
    .optional(),
  occupation: z.string().optional(),
  company: z.string().optional(),
  healthCardNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccount: z.string().optional(),
  medicalNotes: z.string().optional(),
})

// 模擬的用戶資料
const mockUserData = {
  name: "測試用戶",
  idNumber: "A123456789",
  birthdate: new Date("1990-01-01"),
  gender: "male",
  phone: "0912345678",
  email: "test@example.com",
  address: "台北市信義區信義路五段7號",
  emergencyContact: "",
  emergencyPhone: "",
  occupation: "",
  company: "",
  healthCardNumber: "",
  bankName: "",
  bankBranch: "",
  bankAccount: "",
  medicalNotes: "",
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 基本資料表單
  const basicForm = useForm<z.infer<typeof basicFormSchema>>({
    resolver: zodResolver(basicFormSchema),
    defaultValues: {
      name: "",
      idNumber: "",
      birthdate: new Date(),
      gender: "male",
      phone: "",
      email: "",
      address: "",
    },
  })

  // 額外資訊表單
  const additionalForm = useForm<z.infer<typeof additionalFormSchema>>({
    resolver: zodResolver(additionalFormSchema),
    defaultValues: {
      emergencyContact: "",
      emergencyPhone: "",
      occupation: "",
      company: "",
      healthCardNumber: "",
      bankName: "",
      bankBranch: "",
      bankAccount: "",
      medicalNotes: "",
    },
  })

  // 檢查用戶是否已登入
  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const { isLoggedIn, user } = await checkAuth()
        if (isLoggedIn && user) {
          setUser(user)

          // 在實際應用中，這裡會從後端獲取用戶資料
          // 這裡使用模擬數據
          const userData = mockUserData

          // 設置基本資料表單的預設值
          basicForm.reset({
            name: userData.name,
            idNumber: userData.idNumber,
            birthdate: userData.birthdate,
            gender: userData.gender as "male" | "female" | "other",
            phone: userData.phone,
            email: userData.email,
            address: userData.address,
          })

          // 設置額外資訊表單的預設值
          additionalForm.reset({
            emergencyContact: userData.emergencyContact,
            emergencyPhone: userData.emergencyPhone,
            occupation: userData.occupation,
            company: userData.company,
            healthCardNumber: userData.healthCardNumber,
            bankName: userData.bankName,
            bankBranch: userData.bankBranch,
            bankAccount: userData.bankAccount,
            medicalNotes: userData.medicalNotes,
          })
        } else {
          // 如果用戶未登入，重定向到登入頁面
          router.push("/login")
        }
      } catch (error) {
        console.error("檢查身份驗證失敗:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAuthStatus()
  }, [router])

  // 提交基本資料表單
  const onBasicSubmit = async (data: z.infer<typeof basicFormSchema>) => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      // 在實際應用中，這裡會調用 API 更新用戶資料
      console.log("提交的基本資料:", data)

      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 更新用戶資料
      const result = await updateUserProfile({
        ...data,
        type: "basic",
      })

      if (result.success) {
        setSaveSuccess(true)
        // 3 秒後隱藏成功訊息
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error("更新基本資料失敗:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // 提交額外資訊表單
  const onAdditionalSubmit = async (data: z.infer<typeof additionalFormSchema>) => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      // 在實際應用中，這裡會調用 API 更新用戶資料
      console.log("提交的額外資訊:", data)

      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 更新用戶資料
      const result = await updateUserProfile({
        ...data,
        type: "additional",
      })

      if (result.success) {
        setSaveSuccess(true)
        // 3 秒後隱藏成功訊息
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error("更新額外資訊失敗:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p>載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:py-12 md:px-6">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-teal-600" />
          <h1 className="text-2xl font-bold">個人資料</h1>
        </div>

        <p className="text-gray-500">
          請確保您的個人資料是最新的，以便我們能夠為您提供最好的服務。
          基本資料是必填的，而額外資訊可以幫助我們更好地為您提供理賠和福利服務。
        </p>

        {saveSuccess && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertTitle>儲存成功</AlertTitle>
            <AlertDescription>您的個人資料已成功更新。</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">基本資料</TabsTrigger>
            <TabsTrigger value="additional">額外資訊（選填）</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本資料</CardTitle>
                <CardDescription>這些資訊是必填的，用於身份驗證和基本服務。</CardDescription>
              </CardHeader>
              <Form {...basicForm}>
                <form onSubmit={basicForm.handleSubmit(onBasicSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={basicForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>姓名</FormLabel>
                            <FormControl>
                              <Input placeholder="請輸入姓名" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicForm.control}
                        name="idNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>身分證字號</FormLabel>
                            <FormControl>
                              <Input placeholder="請輸入身分證字號" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={basicForm.control}
                        name="birthdate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>出生日期</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    }`}
                                  >
                                    {field.value ? format(field.value, "yyyy-MM-dd") : <span>請選擇日期</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>性別</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="請選擇性別" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">男</SelectItem>
                                <SelectItem value="female">女</SelectItem>
                                <SelectItem value="other">其他</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={basicForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>手機號碼</FormLabel>
                            <FormControl>
                              <Input placeholder="請輸入手機號碼" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>電子郵件</FormLabel>
                            <FormControl>
                              <Input placeholder="請輸入電子郵件" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={basicForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>聯絡地址</FormLabel>
                          <FormControl>
                            <Input placeholder="請輸入聯絡地址" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          儲存中...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          儲存基本資料
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          <TabsContent value="additional">
            <Card>
              <CardHeader>
                <CardTitle>額外資訊</CardTitle>
                <CardDescription>這些資訊是選填的，但可以幫助我們更好地為您提供理賠和福利服務。</CardDescription>
              </CardHeader>
              <Form {...additionalForm}>
                <form onSubmit={additionalForm.handleSubmit(onAdditionalSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">緊急聯絡人</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={additionalForm.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>緊急聯絡人姓名</FormLabel>
                              <FormControl>
                                <Input placeholder="請輸入緊急聯絡人姓名" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={additionalForm.control}
                          name="emergencyPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>緊急聯絡人電話</FormLabel>
                              <FormControl>
                                <Input placeholder="請輸入緊急聯絡人電話" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">職業資訊</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={additionalForm.control}
                          name="occupation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>職業</FormLabel>
                              <FormControl>
                                <Input placeholder="請輸入職業" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={additionalForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>公司名稱</FormLabel>
                              <FormControl>
                                <Input placeholder="請輸入公司名稱" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">健保資訊</h3>
                      <FormField
                        control={additionalForm.control}
                        name="healthCardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>健保卡號</FormLabel>
                            <FormControl>
                              <Input placeholder="請輸入健保卡號" {...field} />
                            </FormControl>
                            <FormDescription>提供健保卡號可以幫助我們更快地處理您的理賠申請。</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">銀行帳戶資訊</h3>
                      <p className="text-sm text-gray-500">用於理賠款項的轉帳，請確保資訊正確。</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={additionalForm.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>銀行名稱</FormLabel>
                              <FormControl>
                                <Input placeholder="請輸入銀行名稱" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={additionalForm.control}
                          name="bankBranch"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>分行名稱</FormLabel>
                              <FormControl>
                                <Input placeholder="請輸入分行名稱" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={additionalForm.control}
                        name="bankAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>帳號</FormLabel>
                            <FormControl>
                              <Input placeholder="請輸入帳號" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">醫療備註</h3>
                      <FormField
                        control={additionalForm.control}
                        name="medicalNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>特殊醫療狀況或過敏史</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="請輸入任何特殊醫療狀況、過敏史或其他醫療相關備註"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              這些資訊可以幫助我們更好地為您提供醫療相關的理賠和福利建議。
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          儲存中...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          儲存額外資訊
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
