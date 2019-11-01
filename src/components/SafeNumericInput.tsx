import {clamp, isString} from "lodash";
import * as React from "react";
import {useCallback, useRef} from "react";
import {INumericInputProps, NumericInput} from "@blueprintjs/core";
import {HTMLInputProps} from "@blueprintjs/core/src/common/props";
import {coalesce} from "../utils/object-utils";

export enum SafeNumericBehavior {
  Ignore,
  Clamp,
}

const isValidNumber = (str: string) => /^(-|\+)?(\d+(\.\d*)?)|(\.\d+)$/.test(str);

/**
 * This function returns value to be displayed. Returned value is either `number` or `undefined` (but not `NaN`).
 */
const toDisplayedValue = (behavior: SafeNumericBehavior,
                          value: number | string | undefined,
                          min?: number,
                          max?: number) => {
  if (value == null) {
    return;
  }

  if (isString(value)) {
    if (!isValidNumber(value)) {
      return;
    }
  } else if (isNaN(value)) {
    return;
  }

  const numValue = Number(value);
  if (behavior === SafeNumericBehavior.Clamp) {
    return clamp(numValue, min == null ? Number.NEGATIVE_INFINITY : min, max == null ? Number.POSITIVE_INFINITY : max);
  } else {
    return numValue;
  }
};

/**
 * Returns logical value. Returned value is either `number` or `NaN` (but not `undefined` or `null`).
 */
const toLogicalValue = (behavior: SafeNumericBehavior,
                        value: number | undefined,
                        min?: number,
                        max?: number) => {
  const displayedValue = toDisplayedValue(behavior, value, min, max);
  return displayedValue == null ? NaN : displayedValue;
};

/**
 * This function returns if two numbers are identical. It treats NaN, undefined and null as identical values.
 */
const isSameNumber = (a?: number, b?: number) => {
  const an = coalesce(a, NaN);
  const bn = coalesce(b, NaN);
  return an === bn || isNaN(an) === isNaN(bn);
};

/**
 * Returns either value or `invalid` if value is `null` or `NaN`
 */
const valueOrInvalid = (value: number | undefined, invalid: number) => value == null || isNaN(value) ? invalid : value;

type Props = HTMLInputProps & Omit<Omit<INumericInputProps, "clampValueOnBlur">, "allowNumericCharactersOnly"> & {
  safeBehavior?: SafeNumericBehavior;
  safeInvalidValue?: number;
};

/**
 * Wrapper around blueprint `NumericInput` that guarantees *safe* behavior for **invalid** values.
 *
 * **Motiivation** `NumericInput` sometimes emits `string` value if entered value is invalid,
 * sometimes fires `NaN` value. This component defines different strategies that allows to *normalize* emitting of
 * `number` value.
 * 1. This component **always** emits `nil` or `number` (never `string`).
 * 2. This component can guarantee that emitted value is **always** valid
 * (`number` and fits into `min`/`max` constraints).
 */
const SafeNumericInput = (props: Props) => {
  const { safeBehavior = SafeNumericBehavior.Ignore, safeInvalidValue = NaN, ...otherProps } = props;

  const lastValueRef = useRef<number | undefined>();
  const valueChange = useCallback((valueAsNumber: number, valueAsString: string) => {
    if (props.onValueChange == null) {
      return;
    }

    let nextValue: number;
    let nextStrValue: string;

    const trimmedValueAsString = valueAsString.trim();
    if (trimmedValueAsString === "+" || trimmedValueAsString === "-") {
      // Only "+" or "-" character is allowed to enter,
      // but need to validate entered value on blur to guarantee that typed value is valid
      nextValue = NaN;
      nextStrValue = "";
    } else if (!isValidNumber(valueAsString) || isNaN(valueAsNumber)) {
      // Use NaN for any invalid value
      nextValue = NaN;
      nextStrValue = "";
    } else {
      // Clamp value if necessary
      nextValue = toLogicalValue(safeBehavior, valueAsNumber, props.min, props.max);
      nextStrValue = String(toDisplayedValue(safeBehavior, nextValue, props.min, props.max));
    }

    // We never emit NaN value until blur.
    // NaN value is emit only on blur when user finished typing.
    if (!isNaN(nextValue) && lastValueRef.current !== nextValue) {
      lastValueRef.current = nextValue;
      props.onValueChange(nextValue, nextStrValue);
    } else {
      lastValueRef.current = nextValue;
    }

  }, [props.min, props.max, props.onValueChange, safeBehavior]);

  const onBlur = useCallback((event) => {
    const displayedValue = toDisplayedValue(safeBehavior, props.value, props.min, props.max);
    if (props.onValueChange && !isSameNumber(lastValueRef.current, displayedValue)) {
      props.onValueChange(
        toLogicalValue(safeBehavior, valueOrInvalid(lastValueRef.current, safeInvalidValue), props.min, props.max),
        String(toDisplayedValue(safeBehavior, valueOrInvalid(lastValueRef.current, safeInvalidValue), props.min, props.max)));
    }

    if (props.onBlur) {
      props.onBlur(event);
    }
  }, [props.value, props.min, props.max, props.onValueChange, props.onBlur, safeBehavior, safeInvalidValue]);

  lastValueRef.current = toDisplayedValue(safeBehavior, props.value, props.min, props.max);

  return <NumericInput {...otherProps}
                       value={toDisplayedValue(safeBehavior, props.value, props.min, props.max)}
                       allowNumericCharactersOnly={true}
                       clampValueOnBlur={false}
                       onBlur={onBlur}
                       onValueChange={valueChange}/>;
};

export default SafeNumericInput;
