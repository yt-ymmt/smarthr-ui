import React, { FC, useCallback, useContext, useRef } from 'react'
import styled from 'styled-components'
import { Transition } from 'react-transition-group'

import { getIsInclude } from '../../libs/map'
import { AccordionPanelItemContext } from './AccordionPanelItem'
import { AccordionPanelContext } from './AccordionPanel'

type Props = {
  className?: string
}

export const AccordionPanelContent: FC<Props> = ({ children, className = '' }) => {
  const { name } = useContext(AccordionPanelItemContext)
  const { expandedItems } = useContext(AccordionPanelContext)
  const isInclude = getIsInclude(expandedItems, name)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const togglePanel = useCallback(
    (node: HTMLElement) => {
      const wrapperHeight = wrapperRef.current ? wrapperRef.current.clientHeight : 0
      node.style.height = `${wrapperHeight}px`
    },
    [wrapperRef],
  )

  const handleEntered = (node: HTMLElement) => {
    node.style.height = 'auto'
  }

  const handleExited = (node: HTMLElement) => {
    node.style.height = '0px'
  }

  return (
    <Transition
      in={isInclude}
      onEntering={togglePanel}
      onEntered={handleEntered}
      onExit={togglePanel}
      onExiting={togglePanel}
      onExited={handleExited}
      timeout={{
        enter: 200,
        exit: 0,
      }}
    >
      {(status) => (
        <CollapseContainer
          id={`${name}-content`}
          role="region"
          className={`${status} ${className}`}
          aria-labelledby={`${name}-trigger`}
          hidden={!isInclude}
        >
          <div ref={wrapperRef}>{children}</div>
        </CollapseContainer>
      )}
    </Transition>
  )
}

const CollapseContainer = styled.div`
  height: 0;
  overflow: hidden;
  transition: height 0.2s ease;

  &.entered {
    height: auto;
  }
`
