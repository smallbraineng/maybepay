import {
  type Connection,
  ConnectionLineType,
  MarkerType,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import '@xyflow/react/dist/style.css'

const MaybePaySection = () => {
  const [percentage, setPercentage] = useState(30)
  const [isDragging, setIsDragging] = useState(false)
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number }[]
  >([])
  const [scrambledWord, setScrambledWord] = useState('later')
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const lastPercentageRef = useRef(30)
  const sectionRef = useRef<HTMLDivElement>(null)
  const hoodiePrice = 80
  // Calculate correlated price based on slider percentage (10% = $90, 90% = $500)
  const correlatedPrice = Math.round(
    90 + ((percentage - 10) / (90 - 10)) * (500 - 90)
  )
  const userPayAmount = Math.round((hoodiePrice * percentage) / 100)
  const overpayAmount = Math.round(correlatedPrice - hoodiePrice)

  // Animation trigger function
  const triggerAnimation = useCallback(() => {
    if (hasAnimated) return
    
    setHasAnimated(true)
    setIsAnimating(true)
    
    // Start with "later" and backspace to "maybe"
    const startWord = 'later'
    const targetWord = 'maybe'
    
    // First backspace from "later" to empty
    let currentWord = startWord
    let step = 0
    
    const backspaceInterval = setInterval(() => {
      if (step < startWord.length) {
        // Backspace one character at a time
        currentWord = startWord.slice(0, startWord.length - step - 1)
        setScrambledWord(currentWord)
        step++
      } else if (step < startWord.length + targetWord.length) {
        // Type "maybe" one character at a time
        const typeIndex = step - startWord.length
        currentWord = targetWord.slice(0, typeIndex + 1)
        setScrambledWord(currentWord)
        step++
      } else {
        // Animation complete
        clearInterval(backspaceInterval)
        setIsAnimating(false)
      }
    }, 150) // Change every 150ms for smooth typing effect
  }, [hasAnimated])

  // Intersection observer to trigger animation when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Small delay when scrolling into view
            setTimeout(() => {
              triggerAnimation()
            }, 500)
          }
        })
      },
      { threshold: 0.3 } // Trigger when 30% of section is visible
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [triggerAnimation, hasAnimated])

  // Expose trigger function globally for button click
  useEffect(() => {
    (window as any).triggerMaybePayAnimation = triggerAnimation
    return () => {
      delete (window as any).triggerMaybePayAnimation
    }
  }, [triggerAnimation])

  const createParticle = useCallback((thumbPositionPercent: number) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect()
      const thumbX = thumbPositionPercent * rect.width
      const thumbY = rect.height / 2

      for (let i = 0; i < 2; i++) {
        const particle = {
          id: Date.now() + Math.random() + i,
          x: thumbX + (Math.random() - 0.5) * 30,
          y: thumbY + (Math.random() - 0.5) * 15,
        }
        setParticles((prev) => [...prev, particle])
      }
    }
  }, [])

  const handleSliderChange = useCallback(
    (newValue: number) => {
      if (newValue === lastPercentageRef.current) return

      setPercentage(newValue)
      lastPercentageRef.current = newValue

      if (isDragging) {
        const thumbPosition = (newValue - 10) / (90 - 10)
        createParticle(thumbPosition)
      }
    },
    [isDragging, createParticle]
  )

  const initialNodes = [
    {
      id: '1',
      type: 'input',
      data: {
        label: (
          <div className="text-center">
            <div className="mb-2">
              <img
                src="/assets/whitehoodie1.png"
                alt="Hoodie"
                className="w-12 h-12 mx-auto rounded object-cover"
              />
            </div>
            <div
              style={{ fontFamily: 'Inter, sans-serif' }}
              className="text-stone-900"
            >
              Hoodie
            </div>
            <div
              style={{ fontFamily: 'ui-monospace, monospace' }}
              className="text-stone-600"
            >
              ${hoodiePrice}
            </div>
          </div>
        ),
      },
      position: { x: 300, y: 70 },
      style: {
        background: 'transparent',
        border: '1px solid #d6d3d1',
        borderRadius: '12px',
        fontSize: '16px',
        padding: '20px',
        width: '180px',
      },
      draggable: false,
    },
    {
      id: '4',
      data: {
        label: (
          <div className="text-center">
            <div
              className="text-stone-900 font-semibold"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Price You Chose
            </div>
            <div
              className="text-stone-600 font-bold text-lg mt-1"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              You Pay ${correlatedPrice}
            </div>
          </div>
        ),
      },
      position: { x: 320, y: 235 },
      style: {
        background: '#fafaf9',
        border: '1px solid #e7e5e4',
        borderRadius: '12px',
        fontSize: '12px',
        padding: '16px',
        width: '140px',
      },
      draggable: false,
    },
    {
      id: '2',
      data: {
        label: (
          <div className="text-center">
            <div
              className="text-green-400 font-bold text-xl"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              {percentage}%
            </div>
            <div className="text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
              Free Hoodie
            </div>
            <div
              className="text-sm text-stone-500 mt-1"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              You Pay $0
            </div>
          </div>
        ),
      },
      position: { x: 150, y: 350 },
      style: {
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '12px',
        fontSize: '14px',
        padding: '20px',
        width: '160px',
      },
      draggable: false,
    },
    {
      id: '3',
      data: {
        label: (
          <div className="text-center">
            <div
              className="text-red-400 font-bold text-xl"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              {100 - percentage}%
            </div>
            <div className="text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
              You overpay by
            </div>
            <div
              className="text-sm text-stone-500 mt-1"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            >
              ${overpayAmount}
            </div>
          </div>
        ),
      },
      position: { x: 450, y: 350 },
      style: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        fontSize: '14px',
        padding: '20px',
        width: '160px',
      },
      draggable: false,
    },
  ]

  const initialEdges = [
    {
      id: 'e1-4',
      source: '1',
      target: '4',
      animated: true,
      style: { stroke: '#d6d3d1', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#d6d3d1' },
    },
    {
      id: 'e4-2',
      source: '4',
      target: '2',
      animated: true,
      style: { stroke: '#86efac', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#86efac' },
    },
    {
      id: 'e4-3',
      source: '4',
      target: '3',
      animated: true,
      style: { stroke: '#fca5a5', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#fca5a5' },
    },
  ]

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '2') {
          return {
            ...node,
            data: {
              label: (
                <div className="text-center">
                  <div
                    className="text-green-400 font-bold text-xl"
                    style={{ fontFamily: 'ui-monospace, monospace' }}
                  >
                    {percentage}%
                  </div>
                  <div
                    className="text-base"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Free Hoodie
                  </div>
                  <div
                    className="text-sm text-stone-500 mt-1"
                    style={{ fontFamily: 'ui-monospace, monospace' }}
                  >
                    You Pay $0
                  </div>
                </div>
              ),
            },
          }
        }
        if (node.id === '3') {
          return {
            ...node,
            data: {
              label: (
                <div className="text-center">
                  <div
                    className="text-red-400 font-bold text-xl"
                    style={{ fontFamily: 'ui-monospace, monospace' }}
                  >
                    {100 - percentage}%
                  </div>
                  <div
                    className="text-base"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    You overpay by
                  </div>
                  <div
                    className="text-sm text-stone-500 mt-1"
                    style={{ fontFamily: 'ui-monospace, monospace' }}
                  >
                    ${overpayAmount}
                  </div>
                </div>
              ),
            },
          }
        }
        if (node.id === '4') {
          return {
            ...node,
            data: {
              label: (
                <div className="text-center">
                  <div
                    className="text-stone-900 font-semibold"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Price You Chose
                  </div>
                  <div
                    className="text-stone-600 font-bold text-sm mt-1"
                    style={{ fontFamily: 'ui-monospace, monospace' }}
                  >
                    You Pay ${correlatedPrice}
                  </div>
                </div>
              ),
            },
          }
        }
        return node
      })
    )
  }, [percentage, setNodes, overpayAmount, correlatedPrice])

  return (
    <div ref={sectionRef} className="w-full pt-12 pb-0 px-6 mb-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
          <div className="lg:w-1/2 lg:order-1 order-2">
            <h2
              className="text-lg md:text-xl text-stone-600 mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Introducing,
            </h2>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-stone-900 mb-8"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              buy now,
              <br />
              pay {scrambledWord}.
            </h1>

            <div className="text-stone-700 text-lg leading-relaxed mb-8">
              <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Why pay MSRP when you could pay nothing?
              </p>
              <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Set your odds. A higher price = higher chance at free exclusive merch.
              </p>
              <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Don't get it free? You overpay.
              </p>
              <p
                className="text-stone-600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Choose "maybe pay" at checkout.
              </p>
            </div>

            <div className="mb-6 relative select-none">
              <label
                htmlFor="odds-slider"
                className="block text-sm font-medium text-stone-700 mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Adjust your odds:{' '}
                <span style={{ fontFamily: 'ui-monospace, monospace' }}>
                  {percentage}%
                </span>
              </label>
              <div
                id="odds-slider"
                ref={sliderRef}
                className="relative w-full h-3 bg-stone-300 rounded-full cursor-pointer select-none"
                role="slider"
                aria-valuenow={percentage}
                aria-valuemin={10}
                aria-valuemax={90}
                tabIndex={0}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const newValue = Math.round(10 + (clickX / rect.width) * 80)
                  const clampedValue = Math.max(10, Math.min(90, newValue))
                  handleSliderChange(clampedValue)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    const newValue = Math.max(10, percentage - 5)
                    handleSliderChange(newValue)
                  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    const newValue = Math.min(90, percentage + 5)
                    handleSliderChange(newValue)
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              >
                <div
                  className="h-full bg-stone-900 rounded-full transition-none pointer-events-none"
                  style={{
                    width: `${((percentage - 10) / (90 - 10)) * 100}%`,
                  }}
                />
                <motion.div
                  className="absolute top-1/2 w-5 h-5 bg-stone-900 border-2 border-white rounded-full shadow-lg cursor-grab select-none"
                  style={{
                    left: `calc(${((percentage - 10) / (90 - 10)) * 100}% - 10px)`,
                    y: '-50%',
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  onDrag={(_, info) => {
                    if (sliderRef.current) {
                      const rect = sliderRef.current.getBoundingClientRect()
                      const newX = info.point.x - rect.left
                      const newValue = Math.round(10 + (newX / rect.width) * 80)
                      const clampedValue = Math.max(10, Math.min(90, newValue))
                      handleSliderChange(clampedValue)
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                />
              </div>
              <AnimatePresence>
                {particles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute pointer-events-none w-1 h-1 bg-stone-900 rounded-full"
                    initial={{
                      x: particle.x,
                      y: particle.y,
                      opacity: 1,
                      scale: 1,
                    }}
                    animate={{
                      x: particle.x + (Math.random() - 0.5) * 15,
                      y: particle.y - 25,
                      opacity: 0,
                      scale: 0,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeOut',
                    }}
                    onAnimationComplete={() => {
                      setParticles((prev) =>
                        prev.filter((p) => p.id !== particle.id)
                      )
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:w-1/2 lg:order-2 order-1 mb-8 lg:mb-0">
            <div style={{ width: '100%', height: '450px' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                attributionPosition="bottom-left"
                proOptions={{ hideAttribution: true }}
                panOnScroll={false}
                zoomOnScroll={false}
                panOnDrag={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                preventScrolling={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaybePaySection
