import {stubTrue} from "lodash";
import {asComposed, asCond, asDebounce, asExclusive, asLeastCommits} from "../../utils/redux-scheduler";
import {ConfigParam} from "../../models/ConfigParam";

const setCanIdProcessor = asComposed(
  // Group tasks by device
  asLeastCommits((task) => task.parameters[0]),
  // Exclusive access mode is turned on for tasks suitable for single device
  asExclusive((test, current) => test.parameters[0] === current.parameters[0]));

// Exclusive access mode is turned on for tasks suitable for single device
// const setCanIdProcessor = asExclusive((test, current) => test.parameters[0] === current.parameters[0]);

const schedule = {
  "set-parameter": asCond(
    // Use exclusive access for settings of CanID parameter
    [(task) => task.parameters[1] === ConfigParam.kCanID, setCanIdProcessor],
    // Debounce settings of non-CanID parameter
    [stubTrue, asDebounce((task) => String(task.parameters[1]), 300)]
  ),
};

export default schedule;
