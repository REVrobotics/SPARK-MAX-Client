// mockTwoWayCall("list-device", ({original}, request) => original().then((response: ListResponseDto): ListResponseDto => {
//   if (request.all) {
//     if (request.root && request.root.device !== "20501") {
//       return {
//         driverList: response.driverList,
//         deviceList: response.deviceList.slice(0, 1).concat(response.deviceList.slice(2)),
//         extendedList: response.extendedList.slice(0, 1).concat(response.extendedList.slice(2))
//           .map((device, i) => ({...device, interfaceName: "CAN", uniqueId: i + 1})),
//       };
//     }
//     return {
//       ...response,
//       extendedList: response.extendedList.map((device) => ({...device, interfaceName: "CAN"}))
//     };
//   } else {
//     return {
//       driverList: response.driverList,
//       deviceList: response.deviceList.slice(0, 2),
//       extendedList: response.extendedList.slice(0, 2).map((device) => ({...device, interfaceName: "CAN"})),
//     };
//   }
// }));
//
// mockTwoWayCall("id-assignment", () => Promise.resolve());
//
// mockTwoWayCall("get-firmware", (ctx, device) => {
//   if (device === "20501") {
//     return ctx.original();
//   } else {
//     return delayPromise(500).then(() => ({
//       version: "V1.3.3"
//     }));
//   }
// });
//
// mockTwoWayCall("load-firmware", () => {
//   mockNotifyScenario("load-firmware-progress", {
//     500: [null, {updateStarted: true}],
//     1500: [null, {isUpdating: true, updateStagePercent: 0.25, updateStageMessage: "Some Update"}],
//     2500: [null, {isUpdating: true, updateStagePercent: 0.5, updateStageMessage: "Some Update"}],
//     3500: [null, {isUpdating: true, updateStagePercent: 0.75, updateStageMessage: "Another One Update"}],
//   });
//
//   return delayPromise(5000).then(() => {
//     return {
//       updateComplete: true,
//       updateCompletedSuccessfully: true,
//     };
//   });
// });
//
// mockCallbackCall("load-firmware-progress", ONLY_MOCK_CALL);
