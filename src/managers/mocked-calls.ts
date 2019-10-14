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
//       ...response,
//       extendedList: response.extendedList
//         .concat(response.extendedList.slice(1).map((item) => ({
//           ...item,
//           deviceId: 20500,
//           uniqueId: 1,
//         })))
//         .concat(response.extendedList.slice(1).map((item) => ({
//           ...item,
//           deviceId: 20523,
//           uniqueId: 0,
//         }))),
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
