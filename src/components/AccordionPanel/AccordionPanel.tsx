import React, { useCallback, useEffect, useRef, useState } from 'react'

import { flatArrayToMap } from '../../libs/map'
import {
  focusFirstSibling,
  focusLastSibling,
  focusNextSibling,
  focusPreviousSibling,
  getNewExpandedItems,
  keycodes,
} from './accordionPanelHelper'

type Props = {
  children: React.ReactNode
  iconPosition?: 'left' | 'right'
  displayIcon?: boolean
  expandableMultiply?: boolean
  defaultExpanded?: string[]
  className?: string
  onClick?: (expandedItems: string[]) => void
}

export const AccordionPanelContext = React.createContext<{
  iconPosition: 'left' | 'right'
  displayIcon: boolean
  expandedItems: Map<string, string>
  expandableMultiply: boolean
  parentRef: React.RefObject<HTMLDivElement> | null
  onClickTrigger?: (itemName: string, isExpanded: boolean) => void
  onClickProps?: (expandedItems: string[]) => void
}>({
  iconPosition: 'left',
  displayIcon: true,
  expandedItems: new Map(),
  expandableMultiply: false,
  parentRef: null,
})

export const AccordionPanel: React.FC<Props> = ({
  children,
  iconPosition = 'left',
  displayIcon = true,
  expandableMultiply = false,
  defaultExpanded = [],
  className = '',
  onClick: onClickProps,
}) => {
  const [expandedItems, setExpanded] = useState(flatArrayToMap(defaultExpanded))
  const parentRef = useRef<HTMLDivElement>(null)

  const onClickTrigger = useCallback(
    (itemName: string, isExpanded: boolean) => {
      setExpanded(getNewExpandedItems(expandedItems, itemName, isExpanded, expandableMultiply))
    },
    [expandableMultiply, expandedItems],
  )

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!parentRef?.current) {
      return
    }

    const keyCode = event.keyCode
    const item = event.target as HTMLElement

    switch (keyCode) {
      case keycodes.HOME: {
        event.preventDefault()
        focusFirstSibling(parentRef.current)
        break
      }
      case keycodes.END: {
        event.preventDefault()
        focusLastSibling(parentRef.current)
        break
      }
      case keycodes.LEFT:
      case keycodes.UP: {
        event.preventDefault()
        focusPreviousSibling(item, parentRef.current)
        break
      }
      case keycodes.RIGHT:
      case keycodes.DOWN: {
        event.preventDefault()
        focusNextSibling(item, parentRef.current)
        break
      }
    }
  }

  useEffect(() => {
    if (defaultExpanded.length > 0) setExpanded(flatArrayToMap(defaultExpanded))
  }, [defaultExpanded])

  return (
    <AccordionPanelContext.Provider
      value={{
        onClickTrigger,
        onClickProps,
        expandedItems,
        iconPosition,
        displayIcon,
        expandableMultiply,
        parentRef,
      }}
    >
      <div className={className} ref={parentRef} onKeyDown={handleKeyPress}>
        {children}
      </div>
    </AccordionPanelContext.Provider>
  )
}
