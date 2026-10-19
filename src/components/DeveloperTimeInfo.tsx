import React from 'react'
import Person from '../interfaces/person'
import { personTimezone } from '../util/mapGeometry'
import {
    developerOffset,
    formatOffset,
    localTimeLabel,
    workdayOverlapHours,
} from '../util/timezone'

interface DeveloperTimeInfoProps {
    person: Person
    recruiterOffset: number
    now: Date
    className?: string
}

const formatHours = (hours: number) =>
    `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`

// "Local time Tue 9:05 PM (UTC+1) · 4h overlap with you"
function DeveloperTimeInfo({
    person,
    recruiterOffset,
    now,
    className,
}: DeveloperTimeInfoProps) {
    const offset = developerOffset(personTimezone(person), now)
    if (offset === null) {
        return <span className={className}>Time zone unknown</span>
    }
    const overlap = workdayOverlapHours(recruiterOffset, offset)
    return (
        <span className={className}>
            Local time {localTimeLabel(offset, now)} ({formatOffset(offset)})
            {' · '}
            {formatHours(overlap)} overlap with you
        </span>
    )
}

export default DeveloperTimeInfo
