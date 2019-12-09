/**
 * In this file developer can mock or change response of calls to main process.
 * Calls are mocked ONLY IN DEV environment.
 */

// import {mockTwoWayCall} from "./mock-renderer-calls";
// import {ListResponseDto} from "../../public/proto-gen";
// import {delayPromise} from "../utils/promise-utils";
//
// mockTwoWayCall("list-device", ({original}, request) => original().then((response: ListResponseDto): ListResponseDto => {
//   if (request.all) {
//     return {
//       "deviceList": [
//         "STM32 DFU",
//         "Candle WINUSB SPARK MAX Motor Controller"
//       ],
//       "driverList": [
//         "\\\\?\\usb#vid_0483&pid_df11#204d305e2031#{3fe809ab-fb91-4cb5-a643-69670d52366e}",
//         "\\\\?\\usb#vid_1d50&pid_606f&mi_00#6&19e7992d&0&0000#{c15b4308-04d3-11e6-b3ea-6057189e6443}"
//       ],
//       "extendedList": [
//         {
//           "interfaceName": "USB",
//           "driverName": "Candle WINUSB SPARK MAX Motor Controller",
//           "deviceName": "Spark Max",
//           "deviceId": 20501,
//           "updateable": true,
//           "uniqueId": 0,
//           "driverDesc": "\\\\?\\usb#vid_1d50&pid_606f&mi_00#6&19e7992d&0&0000#{c15b4308-04d3-11e6-b3ea-6057189e6443}"
//         },
//         {
//           "interfaceName": "USB",
//           "driverName": "Candle WINUSB SPARK MAX Motor Controller",
//           "deviceName": "Spark Max",
//           "deviceId": 20512,
//           "updateable": true,
//           "uniqueId": 0,
//           "driverDesc": "\\\\?\\usb#vid_1d50&pid_606f&mi_00#6&19e7992d&0&0000#{c15b4308-04d3-11e6-b3ea-6057189e6443}"
//         }
//       ],
//       "dfuDevice": [
//         {
//           "deviceType": "STM32 DFU",
//           "recoveryMode": true,
//           "identifier": "\\\\?\\usb#vid_0483&pid_df11#204d305e2031#{3fe809ab-fb91-4cb5-a643-69670d52366e}"
//         },
//         {
//           "deviceType": "STM32 DFU 2",
//           "recoveryMode": true,
//           "identifier": "\\\\?\\usb#vid_0483&pid_df11#204d305e2031#{3fe809ab-fb91-4cb5-a643-69670d52366a}"
//         },
//       ],
//     };
//   } else {
//     return response;
//   }
// }));
//
// // mockTwoWayCall("id-assignment", () => Promise.resolve());
//
// mockTwoWayCall("get-firmware", (ctx, device) => {
//   if (device === "20523") {
//     return delayPromise(500).then(() => ({
//       version: "V1.0.0"
//     }));
//   } else {
//     return ctx.original();
//   }
// });
//
// // mockTwoWayCall("load-firmware", () => {
// //   mockNotifyScenario("load-firmware-progress", {
// //     500: [null, {updateStarted: true}],
// //     1500: [null, {isUpdating: true, updateStagePercent: 0.25, updateStageMessage: "Some Update"}],
// //     2500: [null, {isUpdating: true, updateStagePercent: 0.5, updateStageMessage: "Some Update"}],
// //     3500: [null, {isUpdating: true, updateStagePercent: 0.75, updateStageMessage: "Another One Update"}],
// //   });
// //
// //   return delayPromise(5000).then(() => {
// //     return {
// //       updateComplete: true,
// //       updateCompletedSuccessfully: true,
// //     };
// //   });
// // });
// //
// // mockCallbackCall("load-firmware-progress", CB_ONLY_MOCK_CALL);

// mockTwoWayCall("telemetry-list", () => {
//   return Promise.resolve({
//     signalsAvailable: [],
//   });
// });

//
// mockCallbackCall("resync", CB_ONLY_MOCK_CALL);
//
// setTimeout(() => mockNotify("resync"), 10000);

import {decorateCallbackCall, mockCallbackCall} from "./mock-renderer-calls";

mockCallbackCall("telemetry-event", decorateCallbackCall(([event], next) => {
  if (event.type !== "data") {
    return next([event]);
  }

  const now = new Date();

  next([{
    ...event,
    data: event.data.map((item: any) => ({
      ...item,
      timestampMs: now.getTime(),
    })),
  }]);
}));
