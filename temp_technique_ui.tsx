                  {surgicalTechResult.surgicalTechMapping?.availableTechniques?.map((technique: any, index: number) => (
                    <div key={technique.id || `tech-${index}`} className="border rounded-lg">
                      <div 
                        className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                        onClick={() => toggleTechniqueExpansion(technique.id || `tech-${index}`, technique.name)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {expandedTechniques.has(technique.id || `tech-${index}`) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="font-medium text-sm">{technique.name}</span>
                          </div>
                          <Badge className={technique.isRecommended ? "bg-green-600" : "bg-gray-500"}>
                            {technique.suitability || '適用性待分析'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{technique.estimatedCost || '費用待查'}</span>
                          {technique.isRecommended && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              推薦
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* 展開的詳細內容 */}
                      {expandedTechniques.has(technique.id || `tech-${index}`) && (
                        <div className="px-3 pb-3 border-t bg-gray-50">
                          {/* 技術詳細資訊 */}
                          <div className="space-y-3 mt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="font-medium text-xs text-green-600 mb-1">優點：</p>
                                <ul className="text-xs text-gray-700 space-y-1">
                                  {technique.advantages?.map((adv: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-green-500 mt-0.5">•</span>
                                      {adv}
                                    </li>
                                  )) || <li className="text-gray-400">優點分析中...</li>}
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium text-xs text-red-600 mb-1">缺點：</p>
                                <ul className="text-xs text-gray-700 space-y-1">
                                  {technique.disadvantages?.map((dis: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-red-500 mt-0.5">•</span>
                                      {dis}
                                    </li>
                                  )) || <li className="text-gray-400">缺點分析中...</li>}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="font-medium text-blue-600">恢復時間：</span>
                                <span className="ml-1 text-gray-700">{technique.recoveryTime || '待查'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-orange-600">風險等級：</span>
                                <span className="ml-1 text-gray-700">{technique.riskLevel || '待評估'}</span>
                              </div>
                            </div>
                            
                            {technique.description && (
                              <div className="p-2 bg-white rounded border">
                                <p className="font-medium text-xs text-gray-600 mb-1">技術說明：</p>
                                <p className="text-xs text-gray-700">{technique.description}</p>
                              </div>
                            )}
                            
                            {/* 詳細搜尋結果 */}
                            {techniqueDetailsCache.has(technique.id || `tech-${index}`) && (
                              <div className="space-y-2 mt-3 pt-3 border-t">
                                <h5 className="font-medium text-sm text-purple-600">相關保障資源：</h5>
                                {(() => {
                                  const details = techniqueDetailsCache.get(technique.id || `tech-${index}`)
                                  const allResources = [
                                    ...(details?.personalPolicyResults || []),
                                    ...(details?.networkResources || [])
                                  ]
                                  
                                  return allResources.length > 0 ? (
                                    <div className="grid gap-2">
                                      {allResources.slice(0, 3).map((resource: any, i: number) => (
                                        <div key={i} className="p-2 bg-white rounded border border-gray-200">
                                          <div className="flex items-center gap-2 mb-1">
                                            {resource.category === '保單理賠' ? (
                                              <Shield className="h-3 w-3 text-teal-600" />
                                            ) : (
                                              <Building className="h-3 w-3 text-blue-600" />
                                            )}
                                            <span className="font-medium text-xs">{resource.title}</span>
                                            <Badge className="text-xs px-1 py-0" variant={resource.category === '保單理賠' ? 'default' : 'secondary'}>
                                              {resource.category === '保單理賠' ? '您的保單' : resource.category}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-gray-600">可能理賠/補助：{resource.amount}</p>
                                        </div>
                                      ))}
                                      {allResources.length > 3 && (
                                        <div className="text-xs text-gray-500 text-center py-1">
                                          ...及其他 {allResources.length - 3} 項資源
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-gray-100 rounded text-xs text-gray-500 text-center">
                                      正在搜尋相關資源...
                                    </div>
                                  )
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )) || (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      未找到相關技術資訊
                    </div>
                  )}