import React, { VFC } from 'react'
import styled, { css } from 'styled-components'

import { CheckBox, Props as CheckBoxProps } from '../CheckBox'
import { Theme, useTheme } from '../../hooks/useTheme'

type Props = CheckBoxProps & {
  label: string
}

export const CheckBoxLabel: VFC<Props> = ({ label, className = '', ...props }) => {
  const theme = useTheme()

  return (
    <Wrapper className={className}>
      <Label className={`${props.disabled ? 'disabled' : ''}`} themes={theme}>
        <CheckBox {...props} />
        <Txt themes={theme}>{label}</Txt>
      </Label>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: inline-block;
`
const Label = styled.label<{ themes: Theme }>`
  ${({ themes }) => {
    const { palette } = themes
    // 複数行テキストに対応させるため flex-start にする
    return css`
      display: flex;
      align-items: flex-start;
      color: ${palette.TEXT_BLACK};
      cursor: pointer;

      &.disabled {
        color: ${palette.TEXT_DISABLED};
        cursor: default;
        pointer-events: none;
      }
    `
  }}
`
const Txt = styled.span<{ themes: Theme }>`
  ${({ themes }) => {
    const { size } = themes
    // checkbox と text の位置がずれるため、line-height 分を調整する疑似要素を作る
    return css`
      margin: 0 0 0 ${size.pxToRem(size.space.XXS)};
      font-size: ${size.pxToRem(size.font.TALL)};

      &::before {
        content: '';
        display: block;
        height: 0;
        width: 0;
        margin-top: calc((1 - 1.5) * 0.5em);
      }
    `
  }}
`
