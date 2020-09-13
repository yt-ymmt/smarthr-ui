import React, { FC, useCallback, useContext } from 'react'
import styled, { css } from 'styled-components'

import { Theme, useTheme } from '../../hooks/useTheme'
import { getIsInclude, mapToKeyArray } from '../../libs/map'
import { getNewExpandedItems } from './accordionPanelHelper'
import { AccordionPanelContext } from './AccordionPanel'
import { AccordionPanelItemContext } from './AccordionPanelItem'

import { Heading, HeadingTagTypes, HeadingTypes } from '../Heading'
import { Icon as IconComponent } from '../Icon'

type Props = {
  className?: string
  headingType?: HeadingTypes
  headingTag?: HeadingTagTypes
}

export const AccordionPanelTrigger: FC<Props> = ({
  children,
  className = '',
  headingType = 'blockTitle',
  headingTag,
}) => {
  const theme = useTheme()
  const { name } = useContext(AccordionPanelItemContext)
  const {
    iconPosition,
    displayIcon,
    expandedItems,
    onClickTrigger,
    onClickProps,
    expandableMultiply,
  } = useContext(AccordionPanelContext)

  const isExpanded = getIsInclude(expandedItems, name)
  const expandedClassName = isExpanded ? 'expanded' : ''
  const buttonClassNames = `${className} ${expandedClassName} ${iconPosition}`
  const iconClassNames = `${expandedClassName} ${iconPosition}`

  const handleClick = useCallback(() => {
    if (onClickTrigger) onClickTrigger(name, !isExpanded)

    if (onClickProps) {
      const newExpandedItems = getNewExpandedItems(
        expandedItems,
        name,
        !isExpanded,
        expandableMultiply,
      )
      onClickProps(mapToKeyArray(newExpandedItems))
    }
  }, [onClickTrigger, name, isExpanded, onClickProps, expandedItems, expandableMultiply])

  const caretIcon = <Icon className={iconClassNames} name="fa-caret-down" themes={theme} />

  return (
    <Heading tag={headingTag} type={headingType}>
      <Button
        id={`${name}-trigger`}
        className={buttonClassNames}
        aria-expanded={isExpanded}
        aria-controls={`${name}-content`}
        themes={theme}
        onClick={handleClick}
        data-component="AccordionHeaderButton"
      >
        {displayIcon && iconPosition === 'left' && caretIcon}
        {children}
        {displayIcon && iconPosition === 'right' && caretIcon}
      </Button>
    </Heading>
  )
}

const resetButtonStyle = css`
  background-color: transparent;
  border: none;
  padding: 0;
  appearance: none;
`
const Button = styled.button<{ themes: Theme }>`
  ${resetButtonStyle}
  ${({ themes }) => {
    const { size, palette } = themes

    return css`
      display: flex;
      align-items: center;
      width: 100%;
      padding: ${size.pxToRem(12)} ${size.pxToRem(size.space.XS)};
      cursor: pointer;
      font-size: inherit;
      outline-color: ${palette.OUTLINE};

      &:hover,
      &:focus {
        background-color: ${palette.hoverColor('#fff')};
      }
      &.right {
        justify-content: space-between;
      }
      &.left {
        justify-content: left;
      }
    `
  }}
`
const Icon = styled(IconComponent)<{ themes: Theme }>`
  ${({ themes }) => {
    const { size } = themes

    return css`
      display: inline-flex;
      margin-right: ${size.pxToRem(size.space.XXS)};
      transition: transform 0.3s;

      &.left {
        &.expanded {
          transform: rotate(-180deg);
        }
      }

      &.right {
        margin-right: 0;
        margin-left: ${size.pxToRem(size.space.XXS)};

        &.expanded {
          transform: rotate(180deg);
        }
      }
    `
  }}
`
