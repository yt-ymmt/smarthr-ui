import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'
import dayjs from 'dayjs'

import { Theme, useTheme } from '../../hooks/useTheme'
import { Input } from '../Input'
import { Icon } from '../Icon'
import { Calendar } from '../Calendar'
import { Portal } from './Portal'
import { useOuterClick } from './useOuterClick'
import { useGlobalKeyDown } from './useGlobalKeyDown'
import { parseJpnDateString } from './datePickerHelper'

type Props = {
  value?: string | null
  onChangeDate?: (date: Date | null, value: string) => void
  parseInput?: (input: string) => Date | null
  formatDate?: (date: Date | null) => string
  name?: string
  disabled?: boolean
  error?: boolean
  className?: string
}

export const DatePicker: FC<Props> = ({
  value = null,
  onChangeDate,
  parseInput,
  formatDate,
  name,
  disabled,
  error,
  className,
}) => {
  const stringToDate = useCallback(
    (str?: string | null) => {
      if (!str) {
        return null
      }
      return parseInput ? parseInput(str) : parseJpnDateString(str)
    },
    [parseInput],
  )

  const dateToString = useCallback(
    (_date: Date | null) => {
      if (formatDate) {
        return formatDate(_date)
      }
      if (!_date) {
        return ''
      }
      return dayjs(_date).format('YYYY/MM/DD')
    },
    [formatDate],
  )

  const themes = useTheme()
  const [selectedDate, setSelectedDate] = useState<Date | null>(stringToDate(value))
  const inputRef = useRef<HTMLInputElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const [calendarPosition, setCalendarPosition] = useState({
    top: 0,
    left: 0,
  })
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isCalendarShown, setIsCalendarShown] = useState(false)

  const updateDate = useCallback(
    (newDate: Date | null) => {
      if (
        newDate === selectedDate ||
        (newDate && selectedDate && newDate.getTime() === selectedDate.getTime())
      ) {
        // Do not update date if the new date is same with the old one.
        return
      }
      if (!inputRef.current) {
        return
      }

      // Do not change input value if new date is invalid date
      if (!newDate || dayjs(newDate).isValid()) {
        inputRef.current.value = dateToString(newDate)
      }
      setSelectedDate(newDate)
      onChangeDate && onChangeDate(newDate, inputRef.current.value)
    },
    [selectedDate, dateToString, onChangeDate],
  )

  const switchCalendarVisibility = useCallback((isVisible: boolean) => {
    if (!isVisible) {
      setIsCalendarShown(false)
      return
    }
    if (!inputWrapperRef.current) {
      return
    }
    setIsCalendarShown(true)
    const rect = inputWrapperRef.current.getBoundingClientRect()
    setCalendarPosition({
      top: rect.top + rect.height - 4 + window.pageYOffset,
      left: rect.left + window.pageXOffset,
    })
  }, [])

  useEffect(() => {
    if (!value || !inputRef.current) {
      return
    }
    /**
     * Do not format the given value in the following cases
     * - while input element is focused.
     * - if the given value is not date formattable.
     */
    if (!isInputFocused) {
      const newDate = stringToDate(value)
      if (newDate && dayjs(newDate).isValid()) {
        inputRef.current.value = dateToString(newDate)
        return
      }
    }
    inputRef.current.value = value
  }, [value, isInputFocused, dateToString, stringToDate])

  useOuterClick(
    [inputWrapperRef.current, calendarRef.current],
    useCallback(() => {
      switchCalendarVisibility(false)
    }, [switchCalendarVisibility]),
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !inputRef.current || !calendarRef.current) {
        return
      }
      const calendarButtons = calendarRef.current.querySelectorAll('button')
      if (calendarButtons.length === 0) {
        return
      }
      const firstCalendarButton = calendarButtons[0]
      const lastCalendarButton = calendarButtons[calendarButtons.length - 1]
      if (isInputFocused) {
        if (e.shiftKey) {
          // move focus from Input to previous elements of DatePicker
          switchCalendarVisibility(false)
          return
        }
        // move focus from Input to Calendar
        e.preventDefault()
        firstCalendarButton.focus()
        return
      }
      const currentFocused = Array.from(calendarButtons).find((button) => button === e.target)
      if (e.shiftKey && currentFocused === firstCalendarButton) {
        // move focus from Calendar to Input
        inputRef.current.focus()
        e.preventDefault()
      } else if (!e.shiftKey && currentFocused === lastCalendarButton) {
        // move focus from Calendar to next elements of DatePicker
        inputRef.current.focus()
        switchCalendarVisibility(false)
      }
    },
    [isInputFocused, switchCalendarVisibility],
  )
  useGlobalKeyDown(handleKeyDown)

  return (
    <Container
      className={className}
      onClick={() => {
        if (!disabled && !isCalendarShown) {
          switchCalendarVisibility(true)
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Escape' || e.key === 'Esc') && isCalendarShown) {
          e.stopPropagation()
          requestAnimationFrame(() => {
            // delay hiding calendar because calendar will be displayed when input is focused
            switchCalendarVisibility(false)
          })
          inputRef.current && inputRef.current.focus()
        }
      }}
    >
      <InputWrapper ref={inputWrapperRef}>
        <StyledInput
          type="text"
          name={name}
          onChange={() => {
            if (isCalendarShown) {
              switchCalendarVisibility(false)
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              switchCalendarVisibility(!isCalendarShown)
            }
          }}
          onFocus={() => {
            setIsInputFocused(true)
            switchCalendarVisibility(true)
          }}
          onBlur={(e) => {
            setIsInputFocused(false)
            const inputString = e.target.value
            if (inputString === '') {
              updateDate(null)
              return
            }
            const newDate = parseInput ? parseInput(inputString) : parseJpnDateString(inputString)
            updateDate(newDate)
          }}
          suffix={
            <CalendarIconLayout themes={themes}>
              <CalendarIconWrapper themes={themes}>
                <Icon
                  name="fa-calendar-alt"
                  color={
                    isInputFocused || isCalendarShown
                      ? themes.palette.TEXT_BLACK
                      : themes.palette.BORDER
                  }
                />
              </CalendarIconWrapper>
            </CalendarIconLayout>
          }
          disabled={disabled}
          error={error}
          ref={inputRef}
        />
      </InputWrapper>
      {isCalendarShown && (
        <Portal {...calendarPosition}>
          <Calendar
            value={selectedDate || undefined}
            onSelectDate={(_, selected) => {
              updateDate(selected)
              requestAnimationFrame(() => {
                // delay hiding calendar because calendar will be displayed when input is focused
                switchCalendarVisibility(false)
              })
              inputRef.current && inputRef.current.focus()
            }}
            ref={calendarRef}
          />
        </Portal>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: inline-block;
`
const InputWrapper = styled.div``
const StyledInput = styled(Input)`
  width: 100%;
`
const CalendarIconLayout = styled.span<{ themes: Theme }>(({ themes }) => {
  const { size } = themes
  return css`
    height: 100%;
    padding: ${size.pxToRem(size.space.XXS)} 0;
    box-sizing: border-box;
  `
})
const CalendarIconWrapper = styled.span<{ themes: Theme }>(({ themes }) => {
  const { palette, size } = themes
  return css`
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: 100%;
    padding-left: ${size.pxToRem(size.space.XXS)};
    border-left: 1px solid ${palette.BORDER};
    font-size: ${size.pxToRem(size.font.TALL)};
  `
})
