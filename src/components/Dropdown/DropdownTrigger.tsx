import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'

import { DropdownContext } from './Dropdown'

type Props = {
  children: React.ReactNode
  className?: string
}

export const DropdownTrigger: React.FC<Props> = ({ children, className = '' }) => {
  const { active, onClickTrigger, contentWrapperId, triggerElementRef } = useContext(
    DropdownContext,
  )

  useEffect(() => {
    if (!triggerElementRef.current) {
      return
    }
    // find trigger element and add ARIA
    const trigger = triggerElementRef.current.querySelector('input, button, a[href], [tabindex]')
    if (trigger && trigger instanceof HTMLElement) {
      trigger.setAttribute('aria-expanded', String(active))
      trigger.setAttribute('aria-haspopup', 'dialog')
      if (active) {
        trigger.setAttribute('aria-controls', contentWrapperId)
      }
    }
  }, [triggerElementRef, active, contentWrapperId])

  return (
    <Wrapper
      ref={triggerElementRef}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        onClickTrigger({
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
        })
      }}
      className={className}
    >
      {React.Children.map(children, (child: any) => {
        const props = child.props ? child.props : {}
        const { className: classNameProps = '' } = props

        switch (typeof child) {
          case 'string':
            return child

          case 'object':
            return React.cloneElement(child, {
              className: `${active ? 'active' : ''} ${classNameProps}`,
            })

          default:
            return null
        }
      })}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: inline-block;
`
