// ==UserScript==
// @name         WME DOT Advisories
// @namespace    https://greasyfork.org/en/users/668704-phuz
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @version      1.45
// @description  Overlay DOT Advisories on the WME Map Object
// @author       phuz
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @require      http://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tablesort/5.2.1/tablesort.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tablesort/5.2.1/sorts/tablesort.number.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/tablesort/5.2.1/sorts/tablesort.date.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_fetch
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/hls.js@latest
// @connect      511nj.org
// @connect      511ny.org
// @connect      511pa.com
// @connect      511wi.gov
// @connect      arcgis.com
// @connect      deldot.gov
// @connect      essentialintegrations.com
// @connect      fl511.com
// @connect      md.gov
// @connect      mi.us
// @connect      ohgo.com
// @connect      rehostjson.phuz.repl.co
// @connect      tripcheck.com
// @connect      iteris-atis.com
// @connect      carsprogram.org
/* global OpenLayers */
/* global W */
/* global WazeWrap */
/* global $ */
/* global I18n */
/* global _ */
// ==/UserScript==

let AKDOTLayer, CTDOTLayer, DEDOTLayer, FLDOTLayer, GADOTLayer, ILDOTLayer, INDOTLayer, LADOTLayer, MDDOTLayer, MIDOTLayer, NCDOTLayer, NJDOTLayer, NVDOTLayer, NYDOTLayer, OHDOTLayer, ORDOTLayer, PADOTLayer, TXDOTLayer, WADOTLayer, WIDOTLayer, WVDOTLayer;
let promisesAK, promisesCT, promisesDE, promisesFL, promisesGA, promisesIL, promisesIN, promisesLA, promisesMD, promisesMI, promisesNC, promisesNJ, promisesNV, promisesNY, promisesOH, promisesOR, promisesPA, promisesTX, promisesWA, promisesWI, promisesWV;
let advisoriesAK, advisoriesCT, advisoriesDE, advisoriesFL, advisoriesGA, advisoriesIL, advisoriesIN, advisoriesLA, advisoriesMD, advisoriesMI, advisoriesNC, advisoriesNJ, advisoriesNV, advisoriesNY, advisoriesOH, advisoriesOR, advisoriesPA, advisoriesTX, advisoriesWA, advisoriesWI, advisoriesWV;
var settings;
var state, stateLength, advisories;
const updateMessage = "&#9658; Add start and end time to CT";
const DEIconC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NTZCOTQ4MEMxM0FFNDExOTJCNzgxMEFBMkM5Q0QzRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRjU0MDFBMUJBMEYxMUU1OERGQ0YxMTRGNzU2OUVFMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRjU0MDFBMEJBMEYxMUU1OERGQ0YxMTRGNzU2OUVFMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1LjEgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkYwRjVFQTIwMDlCQUU1MTE4NEU2OTRCNTE0QTVGRkIzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjY1NkI5NDgwQzEzQUU0MTE5MkI3ODEwQUEyQzlDRDNFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+iRjjNgAABVBJREFUeNqsVwlsVFUUPX+Z+Z1OoaWFSqFaU0hYBSSiCdYQhaRKNdFAUlRcMAFL1ABBESMouEYxwTSxRutWIkbBqKQEwxZoWKKGrcoiAqKsBStLO+1s/8/zvP+nzLTzZzpRX+a00+n999x391GEEOh5xOXTsM7+Amgq0px8ojT++wJxjgi6SsZiUIw8aEPuABTl2se6m6z560Z0rpoNJcdI/ngg8QAxlRhFFBNSIEC0ED8R3xIbiEhCWRjqwBHIW9zMi3gyE9M0+xW3UEovJBZAkIyKhEUvJRxVQNkCxaMNp+JH+fcBYhmxzlGldLtpL8TXDBjEHw3EFEQdT6qDxkAfUgG1ZDQUf6ETltN7YZ7YCfH3GZqpj6MB31F0BbGYOmLOLbInlq7cZLs1FIR243gYdy+FPoqe1rxAOADr1D5o46udvAj8heiPDQhvfovvWwGv7znbG8AcN+Wu2aNoHmnix12knomPwz+/CfqY+x1SntC65xF4ZZJNZj+TNwDeyc/CP2871ME3Mcq2h2YT87Imti4enUXv3GuT3vogfDM/5Q3yEgLBK4juXwtB82zipMpQS0bBX7Meav9yJpadY6/TrGE93Z3iatHW0iey+6OXZT6oxUOQU/1earlZURiVLzo3ZalAmHyTyFil3w3ImfE+OuuqZD35IWJLyTuzuxJam4xwU231lRqIK3MhIjvqxH85HR/cZ+tpW5gXsM4fHpTMk3Jj61hTpSwVtV8x9LHTUuPA7A6ufdpJIJWPR8PQym6BMXVZiqh3wiMwmxshOgJ+83hThXfgiDXurjYjitVyZKx8q8ly6VOcGv/fdyGy/RMnO2TYLL6Ob4O34kkofUu6yWplE1hy+Yi1X4V1cvftqKhZ45pcInTVJzovDXDidL1rjUWPbISSmwu1oAhqPlFYxBDS5mNNqdXh70/ZQrvZiFB7QYbkkhIxJV5TrsRG5RIYUxZ170Yxwfbqd6lL1UHc82mJFU9uWPH6A7YJ7RdSFUU6IIJXaZOW3DIdk9s7oRQMduLe9Rll6UVHty//YvobG3mWet3w/VbLyeGxlkN2d4KRqN/w98sR3vIub5fbs8AgwiHkPrEa+rjpCUecP8gkvGQ7Ryu9eU/GBqKPvKfRfqj1T5hHt8QVHOLE2oTogW/IEeWrsweCLOUIWP8wf9vG/n3KyQfZZEyORZ8vpA+dtCMz8eiqzWqfvq2yG0W2vuPcdP0SdLxdSWNO0HS6OWalgNMJ5uGNCLx5Fw38mo3gDKJ7v4KiK1AKy7aoJSP/yNi51KLyVs/46vrIzvoXzGO7EN70BnKmrYT3zvnJiZJporEiShH8fBZj3OYsE5pe2/NZ1+mklU+sFTvq5yiGURRuXGqXhLeiBtmeYMPDvD3DlOOTiwB9L7aix6ajpllX5Ebxmm2lpiP05VyEeAPb1RmOxfh2rLiNg+MLh5S0xCKpMct5bFtXRzwEVZsAbw4T5zNEDzZyHldBHzYZ6oChHPq5EJ2XETvXDPPQBibWdrJHu0jlWUnscWPItAjImSb9u1NWoVQmQm2I/LDKhqLzUZWJZkWYucIJoYcrmHaN9DCxPJ3y3rJlH/FMQlrnGPTZkCFwTDdY1z65cSQnX8D2FtDxb4kR30Tq3BfCrkmRcqSnmjMpVbNM1AXE1ixlXyJW9yaULbGM94zebsHzIfFqNgpVZH84+bmHAT+n+f/auIvxfxPLw8UZVS7kco9+DCkzK/1xLyc52S3YpZKGXH6NWU+MI+qJp+RMcO8qMae2syGWLVIbPIIj0Uhn8FlCLmTT498Y0t/UjLLZlKd8jflHgAEAjYU+RhKpTDQAAAAASUVORK5CYII=';
const DEIconSchRestriction = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowNTdDRTI5RjhFOENFNTExQkIwQkQ3QjFGMjA1NkNGMiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0MzMwRkNCMUJBMDcxMUU1OTE5RjkwMEI5NThDNEVCMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0MzMwRkNCMEJBMDcxMUU1OTE5RjkwMEI5NThDNEVCMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1LjEgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjI4Q0M2MTJGNEVCOUU1MTE4NEU2OTRCNTE0QTVGRkIzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjA1N0NFMjlGOEU4Q0U1MTFCQjBCRDdCMUYyMDU2Q0YyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+YotOJgAABWdJREFUeNqcVwlsFFUY/nY7e7S0tPbQSkstUUu01NBWSzQKIjQaUbAxapAEj5g0KtEYRdEIeETjFYRglEDEIBgleIBnrGgjQY5C01SKFmrTi5ZSethjt7vt7o7fmzfb3ens0fqSL7Mz7/3/995/vX8tqqpCG2oA+LcRCPgAC+KNDCJZ/z0MW0o/rLbYEhYrkJgtn+J1gnh8CNhXBLguAFaTmINYSiwjridyiCR9zgXF2QmLcoK/vyd+I8YM0oLCMRO4pwZwZmqfFMOsfxTweScTP0QLrOV0Ifx8ExAWSdBn/UiD6s3hexnxJL/8SbxDfGYgVr3SqvoIIxbarPIhTX0psZ1YAZ+cQnYJMOs2IItPJZFu4S58LqCHJ+n8FehtFLLXcQN7uLqCqCT6pHpSWSyRiA0jj/iBO52nkeYtAkpepoGXTOwK395CUg/N9wdw9WpugtZt+w6ofR3orgfsuJerrtTd0zWZwBqBNIXYr5EKy9z4GnB3NUmXhkhPchOth4FzJ4Fjz+ma7MAcclUcAeY/zpjRvs4nvg6Lh5jEbxPFmi8XbuFJ18MQ5kNNQP37MtycRMM2oL8+NJ9Ajps/ZAg+GyRfQLwRj7iYHJWaQNFjQOFT5m0dfx5wu4HyvTzdMRltR58xr1vwHi1QDs1VwBqiMAqxRTh/DfVYMZNxVfaWWVlnFdC0X/gPSJ8HZJby5PRMC13R8qV5/U2budYholqh7ifCLRci9vYnM5fv0ExcwGBxZBiViOAJ+lOkxxjzfnxYFhyhpWadjPDwkXYtcMWd8tR+7zL43E4z8cDpAnjcsyAKUP4K8+7/+gg4f0rmgQg6Ty/JB6nULb9dbAZObTLLzamQB/W68zDcfJWZ2N2Vq+0skRUmtcAoPNot00QJKwieHoIp6tMrn9hw3bvASKtRNp3V0GYRoWDByLkcM7Ewg9BhI7Et2Shcu4EVuS9UrVT9xN5+efqgplGavuZFo6w9jRu2Sxm/22EmtqeOaCYRvgz4QoK9LMGnd8qAUsPKTgcD7ewu42bEqc9+QZdUG2MjePHY00bMxDNy26lQhYencHeHBEVA+f1m3xU9DZRuCEZtGJGQWctv+uZH2hmElFcsPiTPbjcTp81thsPRDg8FLhyW3/5hnW87FLmw9taxNLJcBgLGa1Ss7aoFGnfoKVgto1qxNSE5v9VM7MgYReo1P2m7b9rNxcJfL0il6iSIb0c3AlWP0hrj5nmhtfZVEbDM733yPb3oG8aOz0ycwNumdP02+iyAjt9Ziw/IPLQ5IyORSIoypxAZxfLUvU2CxY3SV3ZogRvxdkq6vJ7EuxBQH8Hxl4C7fuEKLg54p9KVhNVDEg+dAX5cLoMvgE1IcBjyzEgsAkLFOn4tx2BHLqru56XGpiIlH9MaffT/wVVMtyHBUEfiN0N5F/126iH5aqaGDxfZTHzFy6X586kRBujvhq28VBcy7zsFaT91rRIZPnlptEagmgKVJP8YrvPAzw/yPuZVN/dhdiC3ss2bLe9frfWhzuEW5jXdcuYTZkS91KrAQx0P8NffkQiUGPvfScEU2mSzZpdOcfETTvpvBiuf4xIZwqKCuXg6r35ZyGZzjFMr+TwYTbkSx3hb9PZu68RK0e4MNIfSKohQdyvMKkgPxIy/KXjuA63TDPYTwQ5T0Z9WQ4MyQCyPRzpVYjE+1bvGwRhrOojbo5pX/X/E0LpONjxEm2nGjwbmwBLihFYeI0H1x/CxGpdc/FtYTIg+p0S/FA6hbON9yCzuiSol9GbdECu41Ml5Hmm06H9n9opbmaddiZzFLmQvmlaNCf13kn0Xb5wjUy2PNm2nKg15GYuMM2taxP8JMAC5wMrd7FP1/wAAAABJRU5ErkJggg==';
const DEIconSchClosure = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAoCAYAAADpE0oSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTYxOTU5RkJGMkQ3MTFFNkI5NERERDM2Qzg4NzcwRUYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTYxOTU5RkNGMkQ3MTFFNkI5NERERDM2Qzg4NzcwRUYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNjE5NTlGOUYyRDcxMUU2Qjk0REREMzZDODg3NzBFRiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNjE5NTlGQUYyRDcxMUU2Qjk0REREMzZDODg3NzBFRiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuSU594AAAfTSURBVHja5Fh7cJTV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';
const Incident = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA/ppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjVEMjA4OTI0OTNCRkRCMTE5MTRBODU5MEQzMTUwOEM4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjk4MDFDMjUwNzIzRDExRTNBQTczRjkyOTZEQ0IyOTY0IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk4MDFDMjRGNzIzRDExRTNBQTczRjkyOTZEQ0IyOTY0IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIElsbHVzdHJhdG9yIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ1dWlkOmFiMzczNzVkLWIwYTYtNDRjNC04OTE4LWU4M2ZiOTRhOGY4NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpjMjUyYWZlMC1mMjU0LWY5NDMtOGZiZi0wMTc3Mzc1ZWEzYzYiLz4gPGRjOnRpdGxlPiA8cmRmOkFsdD4gPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5JbmNpZGVudHNfb3V0bGluZWQ8L3JkZjpsaT4gPC9yZGY6QWx0PiA8L2RjOnRpdGxlPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pmcc3z4AAASdSURBVHja7FdLaFxVGP7OPfc1M5lMJ5M0Gk0nNdE+sogPLNG2KNaFUksqlkAjSGtcCBJUWgouhErAUOhCwb2uXJQupCtF0I102SrEUsFNkRaxJJ3MTGbu+/j/J2lnKp04HdNkY+AnZ875/u9853/ce65QSmEz/wxs8t//AjZdgDkytL1j5whIaRKgvuERCIH9UDjHpsedRqATJwE8Yimcn5LuVv79deztEQJPU0Nf35AILCZq7lXX3jqds8DGY5574Cmgk6OS4PCoJaamcvSjO9HGY57jtQcqwFPot1V85lhByPHptzBw7jttz9H4eK8hnSQ+4xPmfjhlz5YtbQHprChH6vRrTuXQqddfgP3+HGSuANnVDYw9ix3XL+G3X68UfgkduFJ8L9Y7AvUYL+7MipMndig4eQdKNOqXx07exomdCoxh7LqmIFRwbYHP3t1uYHevgXq9CgRNre/X9ByvMYax7LN+EVA4/XKfMTbRJ3GzYiKs+lCh31gOA4Tlul5jDGPZZ10ERAp7C7aYmX7YgvIl6p4Fv+IjCcJGfZAAvxroNcYwln3Y978KkLVEfXK0z0yPmAbKNYEglAjKAZ06bIpAhKASIvBXMIxlH/Zljo4EcBUvRsl7e7vkgYMZC/Ua554E0An98j8iEFAEyh6CwNQYxrIP+zKH6ERATanhHtP46M2sgxydurRMdeeRAM+Ed8tD4gcNAV6g53zf1BjGsg/7Mgdz3ZcAeqbTo158fiRtP/SMsPAnEYYU3sAz6L+EV/IQeY0ijFnAko+I1lYwhvZhX+ZgLuZsW0BVqalRUx6ckA7lVMH3WMCqhSSEU+A3UhBTOgIWEBp3cOzDvszBXMzZlgCiHcwL8ekbho1UYIAKHoqinfirFlIaKAJJEDfVQKTnYlq7jWMf9mUO5mJO5l5TgNKXDDW3H/bAk7GFcqD0hnGTJTGFWatqdiRRVIS8dheWjDmYizmZW60lgACHt0EemVAOkdFJknubYbtY+nn+jl+ZxobltsQzF3MyN+9xV7cNF4f0YahVBkKlLp6UmeI+Kp4qvX5afjEkCjLloO/QK/rnXxe+pU6gqBiiZUt30Vl/UiHOxsvXLCGeJ+4b4nYEeHBLqVMHLKu4zzWROAmodmC2MEP4SA32Izu6W1u62K/nWuGZizmZm/fgvUTzlWw5US8Nm3JmMuMgQzOlVj2jn3pUSl0mRmY/RveecT2X2TWMq++8Te0QQtj39uSSzdKuk5aD+Uoy80cUX8gY4geTaiRPX2ezk92WMZaTWIiTNV9jyo8gM1m4xcZt2t1WRLrgIi6XIdzW10x6gGNMSkwKyzi7EM/S3pdlKpv7YCJvHf/wURvKVrApXKm1LC1h+SU4jgV7eBddk+qof/Mloks/IpNPI+W29nU5fY7CU90GbgRq8Eo9LplpQ4w/QZeaJBVhgaIr2rnKOGlUzn8BZ/7iynXg6mUYhfRqoP/lzU7p7aUs8Z7pJTEuHisOHe1z8FUPvUljhfY+lVkl9VdSXVrp5QyxUWjR5pe2FBCLVC43fRwTj1Mb0kVypBbrLtqQb3XqYkGZhCPw+98CDACt/EZVMWT0ogAAAABJRU5ErkJggg==';
const Roadwork = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA/VpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjVEMjA4OTI0OTNCRkRCMTE5MTRBODU5MEQzMTUwOEM4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkUzRjQ0OTg5NzIzOTExRTM4ODlCRkYwNDVGNDI0RjlEIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkUzRjQ0OTg4NzIzOTExRTM4ODlCRkYwNDVGNDI0RjlEIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIElsbHVzdHJhdG9yIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ1dWlkOmFkOTA4NmJkLTAzMGEtNDA0MS04ZTdiLWJhZGYwNWRmZDMzZiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplNDcyMTVk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';
const PLIcon = 'data:image/gif;base64,R0lGODlhFgAUANUAAOHh4t7e34iKj0dLU0VJUUhMVEpOVk1RWU9TW2xvdXF0enx/hZOVmcbHyVJWXVFVXFRYX1dbYl5iaTtASD5DSz1CSj9ETEFGTkNIUEVKUn6BhoSHjFpeZGBkamVpb2RobmpudGltc2ZqcG1xd2tvdaqsr0ZLUklOVU9UW3h8gdHS08nKy////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACwALAAAAAAWABQAAAZrQJZwSCwaj8ikcskkmTpMI2JSmUxSUaFjIhJCJlkhiHjJMD2YUDECVqKsVuJk4OYGSqeDcEJRTkUACgkrKgx8SgsTH0IcExgeh0oFbUICFo5MBpRCDVkbEyNDEw9hbAYSkWEaVQRhrq+wTEEAOw==';
const reportIcon = 'data:image/gif;base64,R0lGODlhFAAUALMAANcsLNgvL9g4OAMBAc5RUcZVVW1tbQAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAAgALAAAAAAUABQAAARdEKFDqz0y6zO695S2FUBpAkNliBNxmmnFHu6LXmtG2+iXbjWeiYDRuXw2IhAg+CSLkp1wCG31fB6A0jilLrva6g7r3EaDU7MVEGi72yX1mNwJj8CAgpiOFV/+FhIRADs=';
const NJURLDetail = 'https://511nj.org/API/client/Map/getEventPopupData?EventId=';
const NotNY = ['Pennsylvania Statewide', 'New Jersey Statewide', 'Connecticut Statewide'];
const NJConstruction = ['Construction', 'ScheduledConstruction'];

//Begin script function
(function () {
    'use strict';
    //Bootstrap
    window["text123"] = 123;
    function bootstrap(tries = 1) {
        if (W && W.loginManager && W.map && W.loginManager.user && W.model
            && W.model.states && W.model.states.getObjectArray().length && WazeWrap && WazeWrap.Ready) {
            console.log("WME DOT Advisories Loaded!");
            init();
            addListeners();
            if (!OpenLayers.Icon) {
                installIcon();
            }
        } else if (tries < 1000) {
            setTimeout(function () { bootstrap(++tries); }, 200);
        }
    }
    Function.prototype.bind = function (thisObject) {
        var method = this;
        var oldargs = [].slice.call(arguments, 1);
        return function () {
            var newargs = [].slice.call(arguments);
            return method.apply(thisObject, oldargs.concat(newargs));
        };
    }
    //Build the Tab and Settings Division
    function init() {
        var $section = $("<div>");
        $section.html([
            '<div id="chkEnables">',
            '<a href="https://www.waze.com/forum/viewtopic.php?f=819&t=308141" target="_blank">WME DOT Advisories</a> v' + GM_info.script.version + '<br>',
            '* The WME Refresh Button will update reports.',
            '<table border=1 style="text-align:center;width:100%;padding:10px;">',
            '<tr><td style="text-align:center"><b>Enable</b></td><td style="text-align"><b>State</b></td><td width=30><b>Rpt</b></td></tr>',
            '<tr><td><input type="checkbox" id="chkAKDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>AK</td><td><div class=DOTreport data-report="report" data-state="Alaska" id="AK"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkCTDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>CT</td><td><div class=DOTreport data-report="report" data-state="Connecticut" id="CT"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkDEDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>DE</td><td><div class=DOTreport data-report="report" data-state="Delaware" id="DE"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkFLDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>FL</td><td><div class=DOTreport data-report="report" data-state="Florida" id="FL"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkGADOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>GA</td><td><div class=DOTreport data-report="report" data-state="Georgia" id="GA"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkILDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>IL</td><td><div class=DOTreport data-report="report" data-state="Illinois" id="IL"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkINDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>IN</td><td><div class=DOTreport data-report="report" data-state="Indiana" id="IN"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkLADOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>LA</td><td><div class=DOTreport data-report="report" data-state="Louisiana" id="LA"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkMDDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>MD</td><td><div class=DOTreport data-report="report" data-state="Maryland" id="MD"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkMIDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>MI</td><td><div class=DOTreport data-report="report" data-state="Michigan" id="MI"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkNCDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>NC</td><td><div class=DOTreport data-report="report" data-state="North Carolina" id="NC"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkNJDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>NJ</td><td><div class=DOTreport data-report="report" data-state="New Jersey" id="NJ"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkNVDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>NV</td><td><div class=DOTreport data-report="report" data-state="Nevada" id="NV"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkNYDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>NY</td><td><div class=DOTreport data-report="report" data-state="New York" id="NY"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkOHDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>OH</td><td><div class=DOTreport data-report="report" data-state="Ohio" id="OH"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkORDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>OR</td><td><div class=DOTreport data-report="report" data-state="Oregon" id="OR"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkPADOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>PA</td><td><div class=DOTreport data-report="report" data-state="Pennsylvania" id="PA"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkTXDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>TX (Houston)</td><td><div class=DOTreport data-report="report" data-state="Texas" id="TX"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkWADOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>WA</td><td><div class=DOTreport data-report="report" data-state="Washington" id="WA"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkWIDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>WI</td><td><div class=DOTreport data-report="report" data-state="Wisconsin" id="WI"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td><input type="checkbox" id="chkWVDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td>WV</td><td><div class=DOTreport data-report="report" data-state="West Virginia" id="WV"><img src=' + reportIcon + '></div></td></tr>',
            '</table>',
            '</div></div>'
        ].join(' '));
        new WazeWrap.Interface.Tab('DOT Advisories', $section.html(), initializeSettings);
        WazeWrap.Interface.ShowScriptUpdate("WME DOT Advisories", GM_info.script.version, updateMessage, "https://greasyfork.org/en/scripts/412976-wme-dot-advisories", "https://www.waze.com/forum/viewtopic.php?f=819&t=308141");
    }
    getFeed("http://scripts.essentialintegrations.com/CSS", function (result) {
        GM_addStyle(result.responseText);
    })
    //Build the State Layers
    function buildDOTAdvLayers(state) {
        eval(state.substring(0, 2) + 'DOTLayer = new OpenLayers.Layer.Markers(' + state.substring(0, 2) + 'DOTLayer)');
        W.map.addLayer(eval(state.substring(0, 2) + 'DOTLayer'));
        W.map.getOLMap().setLayerIndex(eval(state.substring(0, 2) + 'DOTLayer'), 0);
    }
    function getFeed(url, callback) {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: callback_function1.bind({}, callback)
            //onload: function (response) {
            //    var result = response;
            //    callback(result);
            //}
        });
    }
    function callback_function1(callback, response) {
        var result = response;
        setTimeout(function () { callback(result) }, 150);
    }
    function getAdvisories(state, stateAbv, type) {
        eval('promises' + stateAbv + ' = []');
        eval('advisories' + stateAbv + ' = []');
        let thesepromises = [];
        for (let j = 0; j < state.URL.length; j++) {
            let thispromise = new Promise((resolve, reject) => {
                getFeed(state.URL[j], function (result) {
                    let resultObj = [];
                    resultObj = state.data(JSON.parse(result.responseText), j);
                    for (let i = 0; i < resultObj.length; i++) {
                        if (eval(state.filter(j))) {
                            state.scheme(resultObj[i], j);
                        }
                        //console.log(i + " - " + resultObj.length);
                        if (i == (resultObj.length - 1)) {
                            resolve();
                        }
                    }
                });
            })
            //eval('promises' + stateAbv + '.push(thispromise)');
            thesepromises.push(thispromise);
        }
        Promise.all(thesepromises).then(function () {
            //console.log("got promises..." + type);
            setTimeout(function () { promiseWorker(stateAbv, type) }, 1000);
        })
    }
    function promiseWorker(stateAbv, type) {
        let thisadvisory = eval("advisories" + stateAbv);
        //console.log(eval('promises' + stateAbv + '.length') + " promises");
        Promise.all(eval('promises' + stateAbv))
            .then(function () {
                //console.log(thisadvisory.length + " thisadvisory");
                for (let i = 0; i < thisadvisory.length; i++) {
                    if (type == "report") {
                        let parms = thisadvisory[i];
                        let table = document.getElementById("reportTable").getElementsByTagName('tbody')[0];
                        var row = table.insertRow(-1);
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        var cell4 = row.insertCell(3);
                        cell1.innerHTML = '<div class="gotoPL" data-lat="' + parms.lat + '" data-lon="' + parms.lon + '"><img src=' + PLIcon + '></div>'; //PL
                        cell2.innerHTML = parms.desc;  //Description
                        cell3.innerHTML = parms.title; //Location
                        cell4.innerHTML = parms.time;  //Time
                    } else {
                        drawMarkers(thisadvisory[i]);
                    }
                }
                if ((type == "report")) { //Wait until we loop through all the advisory URLs before sorting the table
                    reportWorker();
                }
            });
    }
    function reportWorker() {
        var elements = document.getElementsByClassName("gotoPL");
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('click', moveMap, false);
        }
        refreshReportTable();
    }
    function refreshReportTable() {
        var sort = new Tablesort(document.getElementById('reportTable'), { descending: true });
        sort.refresh();
        document.getElementById("spinner").style.visibility = "hidden";
    }
    function getReportData(stateAbv, stateName) {
        popupdetails(stateName);
        //if (stateAbv != "NJ") {
        eval('getAdvisories(config.' + stateAbv + ',"' + stateAbv + '", "report")');
        //} else { getNJDOT("report"); }
    }
    //Generate the Advisory markers
    function drawMarkers(parms) {
        var icontype;
        var size = new OpenLayers.Size(20, 20);
        var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
        for (let i = 0; i < parms.keyword.length; i++) { //Check each of the keywords for roadwork/construction
            if (parms.type == parms.keyword[i]) {
                icontype = Roadwork;
                break;
            } else {
                icontype = Incident;
            }
        }
        var icon = new OpenLayers.Icon(icontype, size);
        var epsg4326 = new OpenLayers.Projection("EPSG:4326"); //WGS 1984 projection
        var projectTo = W.map.getProjectionObject(); //The map projection (Spherical Mercator)
        var lonLat = new OpenLayers.LonLat(parms.lon, parms.lat).transform(epsg4326, projectTo);
        var newMarker = new OpenLayers.Marker(lonLat, icon);
        newMarker.eventId = parms.id;
        newMarker.title = parms.title;
        newMarker.desc = parms.desc;
        newMarker.popupType = parms.popupType;
        newMarker.state = parms.state;
        newMarker.timestamp = parms.time;
        newMarker.startTime = parms.startTime;
        newMarker.plannedEndTime = parms.plannedEndTime;
        newMarker.events.register('click', newMarker, popup);
        newMarker.location = lonLat;
        newMarker.recurrence = parms.recurrence;
        if (parms.link != '') {
            newMarker.link = '<a href="' + parms.link + '" target="_blank">Publication Link</a>';
        } else {
            newMarker.link = '';
        }
        eval(parms.state[0] + "DOTLayer.addMarker(newMarker)");
    }
    function popup(evt) {
        $("#gmPopupContainer").remove();
        $("#gmPopupContainer").hide();
        var popupHTML;
        W.map.moveTo(this.location);
        let htmlString = '<div id="gmPopupContainer" style="max-width:500px;margin: 1;text-align: center;padding: 5px;z-index: 1100">' +
            '<a href="#close" id="gmCloseDlgBtn" title="Close" class="modalclose" style="color:#FF0000;">X</a>' +
            '<table border=0><tr><td><div id="mydivheader" style="min-height: 20px;">' + this.title + '</div></div>' +
            '<hr class="myhrline"/>Updated: ' + this.timestamp.toLocaleString();
        if (this.startTime != null)
        {
            htmlString += '<br/>Start: ' + this.startTime.toLocaleString();
        }
        if (this.plannedEndTime != null)
        {
            htmlString += '<br/>Planned End: ' + this.plannedEndTime.toLocaleString();
        }
        if (this.recurrence != null)
        {
            htmlString += '<br/>Recurrence: ' + this.recurrence;
        }
        htmlString += '<hr class="myhrline"/></td></tr><tr><td>' + this.desc + '</td></tr>' +
            '<tr><td>' + this.link + '</td></tr>' +
            '</table>' +
            '</div>';
        popupHTML = ([htmlString]);
        $("body").append(popupHTML);
        //Position the modal based on the position of the click event
        $("#gmPopupContainer").css({ left: document.getElementById("user-tabs").offsetWidth + W.map.getPixelFromLonLat(W.map.getCenter()).x - document.getElementById("gmPopupContainer").clientWidth - 10 });
        $("#gmPopupContainer").css({ top: document.getElementById("left-app-head").offsetHeight + W.map.getPixelFromLonLat(W.map.getCenter()).y - (document.getElementById("gmPopupContainer").clientHeight / 2) });
        $("#gmPopupContainer").show();
        //Add listener for popup's "Close" button
        $("#gmCloseDlgBtn").click(function () {
            $("#gmPopupContainer").remove();
            $("#gmPopupContainer").hide();
        });
        dragElement(document.getElementById("gmPopupContainer"));
    }
    function popupdetails(stateName) {
        $("#gmPopupContainer").remove();
        $("#gmPopupContainer").hide();
        var popupHTML;
        popupHTML = (['<div id="gmPopupContainer" style="max-width:750px;max-height:500px;margin:1;text-align:center;padding: 5px;z-index: 1100">' +
            '<a href="#close" id="popupdetailsclose" title="Close" class="modalclose" style="color:#FF0000;">X</a>' +
            '<table border=0><tr><td><div id="mydivheader" style="float:center">' + stateName + ' Reports <div id="spinner" class="spinner" style="float:left;position:relative;left:70%">' +
            '<div class="bounce1" style="float:left;position:relative;left:40%"></div><div class="bounce2" style="float:left;position:relative;left:50%"></div><div class="bounce3" style="float:left;position:relative;left:60%"></div></div></td></tr>' +
            '<tr><td>' +
            '<div style="width:720px; height:450px; overflow:auto;"><table id="reportTable" border=1>' +
            '<thead><tr><td data-sort-method="none" width=30><b>PL</b></td><th width=394>Description</th><th width=100>Location</th><th data-sort-default width=210>Time</th></tr></thead>' +
            '<tbody></tbody></table></div>' +
            '</td></tr></table>' +
            '</div>'
        ]);
        $("body").append(popupHTML);
        //Position the modal based on the position of the click event
        $("#gmPopupContainer").css({ left: 350 });
        $("#gmPopupContainer").css({ top: 100 });
        $("#gmPopupContainer").show();
        //Add listener for popup's "Close" button
        $("#popupdetailsclose").click(function () {
            $("#gmPopupContainer").remove();
            $("#gmPopupContainer").hide();
        });
        dragElement(document.getElementById("gmPopupContainer"));
    }
    // Make the DIV element draggable
    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById("mydivheader")) {
            // if present, the header is where you move the DIV from:
            document.getElementById("mydivheader").onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown;
        }
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    //Move map to coordinates specified
    function moveMap() {
        var epsg4326 = new OpenLayers.Projection("EPSG:4326"); //WGS 1984 projection
        var projectTo = W.map.getProjectionObject(); //The map projection (Spherical Mercator)
        var lat = this.getAttribute("data-lat");
        var lon = this.getAttribute("data-lon");
        W.map.moveTo(new OpenLayers.LonLat(lon, lat).transform(epsg4326, projectTo), 6);
    }
    //Initialize Settings
    function initializeSettings() {
        stateLength = document.getElementsByClassName("WMEDOTAdvSettingsCheckbox").length;
        loadSettings();
        //Set the state checkboxes according to saved settings
        for (var i = 0; i < stateLength; i++) {
            state = document.getElementsByClassName("WMEDOTAdvSettingsCheckbox")[i].id.replace("chk", "").replace("DOTEnabled", "");
            setChecked('chk' + state + 'DOTEnabled', eval('settings.' + state + 'DOTEnabled'));
        }
        //Build the layers for the selected states
        for (var i = 0; i < stateLength; i++) {
            state = document.getElementsByClassName("WMEDOTAdvSettingsCheckbox")[i].id.replace("chk", "").replace("DOTEnabled", "");
            if (document.getElementById('chk' + state + 'DOTEnabled').checked) { buildDOTAdvLayers(state); eval('getAdvisories(config.' + state + ',"' + state + '")') }
        }
    }
    function addListeners() {
        //Add event listener to report icon
        for (var i = 0; i < document.getElementsByClassName("DOTreport").length; i++) {
            document.getElementsByClassName("DOTreport")[i].addEventListener('click', function (e) { getReportData(this.getAttribute("id"), this.getAttribute("data-state")); }, false);
        }
        //Refresh selected states when WME's refresh button is clicked
        document.getElementsByClassName("reload-button-region")[0].addEventListener('click', function (e) {
            for (var i = 0; i < stateLength; i++) {
                state = document.getElementsByClassName("WMEDOTAdvSettingsCheckbox")[i].id.replace("chk", "").replace("DOTEnabled", "");
                if (document.getElementsByClassName("WMEDOTAdvSettingsCheckbox")[i].checked) { eval('W.map.removeLayer(' + state + 'DOTLayer)'); }
            }
            initializeSettings();
        });
        //Add Handler for Checkbox Setting Changes
        $('.WMEDOTAdvSettingsCheckbox').change(function () {
            var settingName = $(this)[0].id.substr(3);
            settings[settingName] = this.checked;
            saveSettings();
            if (this.checked) {
                buildDOTAdvLayers(settingName.substring(0, 2));
                eval('getAdvisories(config.' + settingName.substring(0, 2) + ',' + "settingName.substring(0, 2)" + ')');
            }
            else {
                //eval(settingName.substring(0,2) + "DOTLayer.destroy()");
                eval('W.map.removeLayer(' + settingName.substring(0, 2) + 'DOTLayer)');
            }
        });
    }
    //Set Checkbox from Settings
    function setChecked(checkboxId, checked) {
        $('#' + checkboxId).prop('checked', checked);
    }
    //Load Saved Settings
    function loadSettings() {
        var loadedSettings = $.parseJSON(localStorage.getItem("WMEDOT_Settings"));
        var defaultSettings = {
            Enabled: false,
        };
        settings = loadedSettings ? loadedSettings : defaultSettings;
        for (var prop in defaultSettings) {
            if (!settings.hasOwnProperty(prop)) {
                settings[prop] = defaultSettings[prop];
            }
        }
    }
    //Save Tab Settings
    function saveSettings() {
        if (localStorage) {
            var localsettings = {};
            for (var i = 0; i < stateLength; i++) {
                state = document.getElementsByClassName("WMEDOTAdvSettingsCheckbox")[i].id.replace("chk", "").replace("DOTEnabled", "");
                eval('localsettings.' + state + 'DOTEnabled = document.getElementsByClassName("WMEDOTAdvSettingsCheckbox")[i].checked');
            }
        }
        localStorage.setItem("WMEDOT_Settings", JSON.stringify(localsettings));
    }
    //Add the Icon Class to OpenLayers
    function installIcon() {
        console.log('Installing OpenLayers.Icon');
        OpenLayers.Icon = OpenLayers.Class({
            url: null,
            size: null,
            offset: null,
            calculateOffset: null,
            imageDiv: null,
            px: null,
            initialize: function (a, b, c, d) {
                this.url = a;
                this.size = b || { w: 20, h: 20 };
                this.offset = c || { x: -(this.size.w / 2), y: -(this.size.h / 2) };
                this.calculateOffset = d;
                a = OpenLayers.Util.createUniqueID("OL_Icon_");
                let div = this.imageDiv = OpenLayers.Util.createAlphaImageDiv(a);
                $(div.firstChild).removeClass('olAlphaImg'); // LEAVE THIS LINE TO PREVENT WME-HARDHATS SCRIPT FROM TURNING ALL ICONS INTO HARDHAT WAZERS --MAPOMATIC
            },
            destroy: function () { this.erase(); OpenLayers.Event.stopObservingElement(this.imageDiv.firstChild); this.imageDiv.innerHTML = ""; this.imageDiv = null; },
            clone: function () { return new OpenLayers.Icon(this.url, this.size, this.offset, this.calculateOffset); },
            setSize: function (a) { null !== a && (this.size = a); this.draw(); },
            setUrl: function (a) { null !== a && (this.url = a); this.draw(); },
            draw: function (a) {
                OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv, null, null, this.size, this.url, "absolute");
                this.moveTo(a);
                return this.imageDiv;
            },
            erase: function () { null !== this.imageDiv && null !== this.imageDiv.parentNode && OpenLayers.Element.remove(this.imageDiv); },
            setOpacity: function (a) { OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv, null, null, null, null, null, null, null, a); },
            moveTo: function (a) {
                null !== a && (this.px = a);
                null !== this.imageDiv && (null === this.px ? this.display(!1) : (
                    this.calculateOffset && (this.offset = this.calculateOffset(this.size)),
                    OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv, null, { x: this.px.x + this.offset.x, y: this.px.y + this.offset.y })
                ));
            },
            display: function (a) { this.imageDiv.style.display = a ? "" : "none"; },
            isDrawn: function () { return this.imageDiv && this.imageDiv.parentNode && 11 != this.imageDiv.parentNode.nodeType; },
            CLASS_NAME: "OpenLayers.Icon"
        });
    }
    bootstrap();
    const config = { //Configuration data for each state
        AK: {
            data(res, index) {
                let resultText = [res];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = ['(resultObj[i].LanesAffected).replace(/ +(?= )/g, "") == ("All Lanes Closed")'];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesAK.push(new Promise((resolve, reject) => {
                    advisoriesAK.push({
                        state: ['AK', 'Alaska'],
                        id: obj.ID,
                        popupType: 0,
                        title: obj.RoadwayName,
                        lon: obj.Longitude,
                        lat: obj.Latitude,
                        type: obj.EventType,
                        keyword: ['roadwork'], //keywords for roadwork/construction
                        desc: obj.Description,
                        time: moment(new Date(obj.LastUpdated * 1000)).format('LLL'),
                        link: ''
                    });
                    resolve();
                }))
            },
            URL: ['http://scripts.essentialintegrations.com/AK']
        },
        CT: {
            data(res, index) {
                let resultText = [res.data];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = ['resultObj[i].eventSubType != "Queue"'];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesCT.push(new Promise((resolve, reject) => {
                    advisoriesCT.push({
                        state: ['CT', 'Connecticut'],
                        id: obj.DT_RowId,
                        popupType: 0,
                        title: obj.roadwayName,
                        lon: obj.location[1],
                        lat: obj.location[0],
                        type: obj.eventSubType,
                        keyword: ['Construction'], //keywords for roadwork/construction
                        desc: obj.description,
                        startTime: obj.startTime,
                        plannedEndTime: obj.endTime,
                        time: obj.lastUpdated,
                        link: ''
                    });
                    resolve();
                }))
            },
            URL: ['http://scripts.essentialintegrations.com/CT']
        },
        DE: {
            data(res, index) {
                let resultText = [res.advisories, res, res.features];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true, '(resultObj[i].str.impactType == "Closure") || ((resultObj[i].str.impactType == "Restriction") && ((resultObj[i].str.construction.toUpperCase().includes("AMP CLOS") || (resultObj[i].str.construction.toUpperCase().includes("ROAD CLOS")))))', true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                switch (index) {
                    case 0:
                        promisesDE.push(new Promise((resolve, reject) => {
                            advisoriesDE.push({
                                state: ['DE', 'Delaware'],
                                id: obj.id,
                                popupType: 0,
                                title: obj.where.county.name,
                                lon: obj.where.lon,
                                lat: obj.where.lat,
                                type: obj.type.name,
                                keyword: ['Construction'], //keyword for roadwork/construction
                                desc: obj.where.location,
                                time: moment(new Date(obj.timestamp)).format('LLL'),
                                link: obj.published.linkbackUrl
                            });
                            resolve();
                        }))
                        break;
                    case 1:
                        var pubLink;
                        if (obj.str.releaseId) {
                            if (obj.str.releaseId.toString() == "-1") {
                                pubLink = '';
                            } else {
                                pubLink = 'https://deldot.gov/About/news/index.shtml?dc=release&id=' + obj.str.releaseId;
                            }
                        }
                        promisesDE.push(new Promise((resolve, reject) => {
                            advisoriesDE.push({
                                state: ['DE', 'Delaware'],
                                id: obj.str.strId,
                                popupType: 0,
                                title: obj.str.county,
                                lon: obj.str.longitude,
                                lat: obj.str.latitude,
                                type: obj.str.impactType,
                                keyword: ['Closure'], //keywords for roadwork/construction
                                desc: obj.str.title + " - " + obj.str.construction,
                                time: moment(new Date(obj.str.actualStartDate)).format('LLL'),
                                link: pubLink
                            });
                            resolve();
                        }))
                        break;
                    case 2:
                        var direction, WorkType;
                        switch (obj.attributes.direction) {
                            case 'ONE_DIRECTION':
                                direction = "One Way from ";
                                break;
                            case 'BOTH_DIRECTIONS':
                                direction = "Both Ways between ";
                        }
                        switch (obj.attributes.WorkType) {
                            case "1":
                                WorkType = "Gas Work";
                                break;
                            case "2":
                                WorkType = "Street Work (city)";
                                break;
                            case "3":
                                WorkType = "Street Work (DelDOT)";
                                break;
                            case "4":
                                WorkType = "Water Work";
                                break;
                            case "5":
                                WorkType = "Work (other)";
                                break;
                            case "6":
                                WorkType = "Sewer Work";
                        }
                        if (obj.attributes.street != null) {
                            var originShift = 2.0 * Math.PI * 6378137.0 / 2.0;
                            var lon = (obj.geometry.paths[0][0][0] / originShift) * 180.0;
                            var lat = (obj.geometry.paths[0][0][1] / originShift) * 180.0;
                            lat = 180.0 / Math.PI * (2.0 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0);
                            promisesDE.push(new Promise((resolve, reject) => {
                                advisoriesDE.push({
                                    state: ['DE', 'Delaware'],
                                    id: obj.attributes.OBJECTID,
                                    popupType: 0,
                                    title: 'Wilmington Road Closures',
                                    lon: lon,
                                    lat: lat,
                                    type: 'Closure',
                                    keyword: ['Closure'], //keywords for roadwork/construction
                                    desc: WorkType + ' - ' + direction + obj.attributes.StartingFrom + ' to ' + obj.attributes.EndingAt + '<br> from ' + moment(new Date(obj.attributes.starttime)).format('LLL') + ' to ' + moment(new Date(obj.attributes.endtime)).format('LLL'),
                                    time: moment(new Date(obj.attributes.EditDate)).format('LLL'),
                                    link: ''
                                });
                                resolve();
                            }))
                        }
                }
            },
            URL: ['https://tmc.deldot.gov/json/advisory.json', 'https://deldot.gov/json/str.json', 'https://services.arcgis.com/hQ3wdpbjO3fPf612/ArcGIS/rest/services/RoadClosures_5b3e88c5556242dfa6e058198be7eb52_public/FeatureServer/1/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=standard&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=']
        },
        FL: {
            data(res, index) {
                let resultText = [res.item2, res.item2, res.item2];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true, true, true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                switch (index) {
                    case 0:
                        promisesFL.push(new Promise((resolve, reject) => {
                            //setTimeout(function () { resolve() }, 4000);
                            getFeed(config.FL.detailURL[0] + obj.itemId.replace("/ /g", "%20"), async function (result) {
                                var eventObj = JSON.parse(result.responseText);
                                if (eventObj.details.detailLang1.eventTypeName == "Closures") {
                                    advisoriesFL.push({
                                        state: ['FL', 'Florida'],
                                        id: eventObj.id.id,
                                        popupType: 0,
                                        title: eventObj.areas.area5.areaLang1,
                                        lon: eventObj.coordinates.locationLongitude / 1000000,
                                        lat: eventObj.coordinates.locationLatitude / 1000000,
                                        type: eventObj.details.detailLang1.eventTypeName,
                                        keyword: ['Construction'], //keywords for roadwork/construction
                                        desc: eventObj.details.detailLang1.eventDescription,
                                        time: moment(new Date(eventObj.dates.lastUpdated)).format('LLL'),
                                        link: ''
                                    });
                                }
                                resolve();
                            });
                        }));
                        break;
                    case 1:
                        promisesFL.push(new Promise((resolve, reject) => {
                            //setTimeout(function () { resolve() }, 4000);
                            getFeed(config.FL.detailURL[1] + obj.itemId.replace("/ /g", "%20"), async function (result) {
                                var eventObj = JSON.parse(result.responseText);
                                if (eventObj.details.detailLang1.eventTypeName == "Closures") {
                                    advisoriesFL.push({
                                        state: ['FL', 'Florida'],
                                        id: eventObj.id.id,
                                        popupType: 0,
                                        title: eventObj.areas.area5.areaLang1,
                                        lon: eventObj.coordinates.locationLongitude / 1000000,
                                        lat: eventObj.coordinates.locationLatitude / 1000000,
                                        type: eventObj.details.detailLang1.eventTypeName,
                                        keyword: ['Closures'], //keywords for roadwork/construction
                                        desc: eventObj.details.detailLang1.eventDescription,
                                        time: moment(new Date(eventObj.dates.lastUpdated)).format('LLL'),
                                        link: ''
                                    });
                                }
                                resolve();
                            });
                        }));
                        break;
                    case 2:
                        promisesFL.push(new Promise((resolve, reject) => {
                            //setTimeout(function () { resolve() }, 4000);
                            getFeed(config.FL.detailURL[1] + obj.itemId.replace("/ /g", "%20"), async function (result) {
                                var eventObj = JSON.parse(result.responseText);
                                if (eventObj.details.detailLang1.eventTypeName == "Closures") {
                                    advisoriesFL.push({
                                        state: ['FL', 'Florida'],
                                        id: eventObj.id.id,
                                        popupType: 0,
                                        title: eventObj.areas.area5.areaLang1,
                                        lon: eventObj.coordinates.locationLongitude / 1000000,
                                        lat: eventObj.coordinates.locationLatitude / 1000000,
                                        type: eventObj.details.detailLang1.eventTypeName,
                                        keyword: ['Constructions'], //keywords for roadwork/construction
                                        desc: eventObj.details.detailLang1.eventDescription,
                                        time: moment(new Date(eventObj.dates.lastUpdated)).format('LLL'),
                                        link: ''
                                    });
                                }
                                resolve();
                            });
                        }));
                }
            },
            URL: ['https://fl511.com/map/mapIcons/Incidents?_=1604955914474', 'https://fl511.com/map/mapIcons/Construction?_=1604965926997', 'https://fl511.com/map/mapIcons/Closures?_=1604965926997'],
            detailURL: ['https://fl511.com/map/data/Incidents/', 'https://fl511.com/map/data/Construction/', 'https://fl511.com/map/data/Closures/']
        },
        GA: {
            data(res, index) {
                let resultText = [res.features, res.features];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true, true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                switch (index) {
                    case 0:
                        promisesGA.push(new Promise((resolve, reject) => {
                            advisoriesGA.push({
                                state: ['GA', 'Georgia'],
                                id: obj.id,
                                popupType: 0,
                                title: obj.properties.headline + ' - ' + obj.properties.route,
                                lon: obj.geometry.coordinates[0],
                                lat: obj.geometry.coordinates[1],
                                type: obj.properties.headline,
                                keyword: ['Construction', 'Emergency Roadwork'], //keyword for roadwork/construction
                                desc: obj.properties.location_description + '<br>' + obj.properties.lanes,
                                time: moment(new Date(obj.properties.start * 1000)).format('LLL'),
                                link: ''
                            });
                            resolve();
                        }))
                        break;
                    case 1:
                        promisesGA.push(new Promise((resolve, reject) => {
                            advisoriesGA.push({
                                state: ['GA', 'Georgia'],
                                id: obj.id,
                                popupType: 0,
                                title: obj.properties.headline + ' - ' + obj.properties.route,
                                lon: obj.geometry.coordinates[0],
                                lat: obj.geometry.coordinates[1],
                                type: obj.properties.headline,
                                keyword: ['Construction', 'Emergency Roadwork'], //keyword for roadwork/construction
                                desc: obj.properties.location_description + '<br>' + obj.properties.lanes,
                                time: moment(new Date(obj.properties.start * 1000)).format('LLL'),
                                link: ''
                            });
                            resolve();
                        }))
                }
            },
            URL: ['https://ga.cdn.iteris-atis.com/geojson/icons/metadata/icons.construction.geojson', 'https://ga.cdn.iteris-atis.com/geojson/icons/metadata/icons.incident.geojson']
        },
        IL: {
            data(res, index) {
                let resultText = [res.features, res.features, res.features];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true, true, true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                switch (index) {
                    case 0:
                        promisesIL.push(new Promise((resolve, reject) => {
                            advisoriesIL.push({
                                state: ['IL', 'Illinois'],
                                id: obj.attributes.OBJECTID,
                                popupType: 0,
                                title: obj.attributes.NearTown,
                                lon: obj.geometry.x,
                                lat: obj.geometry.y,
                                type: "Construction",
                                keyword: ['Construction'], //keywords for roadwork/construction
                                desc: 'Closed from ' + obj.attributes.Location + '<br> from ' + moment(new Date(obj.attributes.StartDate)).format('LLL') + ' to ' + moment(new Date(obj.attributes.EndDate)).format('LLL'),
                                time: moment(new Date(obj.attributes.StartDate)).format('LLL'),
                                link: obj.attributes.WebAddress
                            });
                            resolve();
                        }))
                        break;
                    case 1:
                        var DateUpdate;
                        if (obj.attributes.DateUpdate == null) {
                            DateUpdate = moment(new Date(obj.attributes.DateEntered)).format('LLL');
                        } else {
                            DateUpdate = moment(new Date(obj.attributes.DateUpdate)).format('LLL');
                        }
                        var originShift = 2.0 * Math.PI * 6378137.0 / 2.0;
                        var lon = (obj.geometry.paths[0][0][0] / originShift) * 180.0;
                        var lat = (obj.geometry.paths[0][0][1] / originShift) * 180.0;
                        lat = 180.0 / Math.PI * (2.0 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0);
                        if (obj.attributes.SuggestionToMotorist.includes("Closed")) {
                            promisesIL.push(new Promise((resolve, reject) => {
                                advisoriesIL.push({
                                    state: ['IL', 'Illinois'],
                                    id: obj.attributes.OBJECTID,
                                    popupType: 0,
                                    title: obj.attributes.County,
                                    lon: lon,
                                    lat: lat,
                                    type: "Construction",
                                    keyword: ['Construction'], //keywords for roadwork/construction
                                    desc: 'Closed from ' + obj.attributes.Location + '<br> from ' + moment(new Date(obj.attributes.StartDate)).format('LLL') + ' to ' + moment(new Date(obj.attributes.EndDate)).format('LLL'),
                                    time: DateUpdate,
                                    link: obj.attributes.WebAddress
                                });
                                resolve();
                            }))
                        }
                        break;
                    case 2:
                        promisesIL.push(new Promise((resolve, reject) => {
                            advisoriesIL.push({
                                state: ['IL', 'Illinois'],
                                id: obj.attributes.OBJECTID,
                                popupType: 0,
                                title: obj.attributes.NearTown,
                                lon: obj.geometry.paths[0][0][0],
                                lat: obj.geometry.paths[0][0][1],
                                type: "",
                                keyword: ['Flooding'], //keywords for roadwork/construction
                                desc: 'Closed from ' + obj.attributes.Location + '<br> from ' + moment(new Date(obj.attributes.StartDate)).format('LLL') + ' to ' + moment(new Date(obj.attributes.EndDate)).format('LLL'),
                                time: moment(new Date(obj.attributes.StartDate)).format('LLL'),
                                link: ''
                            });
                            resolve();
                        }))
                }
            },

            URL: ['https://services2.arcgis.com/aIrBD8yn1TDTEXoz/ArcGIS/rest/services/ClosureIncidents/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=', 'https://services2.arcgis.com/aIrBD8yn1TDTEXoz/ArcGIS/rest/services/RoadConstruction_View/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=', 'https://services2.arcgis.com/aIrBD8yn1TDTEXoz/ArcGIS/rest/services/Flooding_Road_Closures/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=']
        },
        IN: {
            data(res, index) {
                let resultText = [res];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesIN.push(new Promise((resolve, reject) => {
                    advisoriesIN.push({
                        state: ['IN', 'Indiana'],
                        id: obj.id,
                        popupType: 0,
                        title: obj.location.routeDesignator,
                        lon: obj.location.primaryPoint.lon,
                        lat: obj.location.primaryPoint.lat,
                        type: 'Construction',
                        keyword: ['Construction'], //keywords for roadwork/construction
                        desc: obj.eventDescription.tooltip,
                        time: moment(new Date(obj.updateTime.time)).format('LLL'),
                        link: ''
                    });
                    resolve();
                }))
            },
            URL: ['https://indot.carsprogram.org/tgevents/api/eventReports?maxPriority=2&maxBeginDateOffset=7200000&minEndDateOffset=0&eventClassifications%5B%5D=roadReports&eventClassifications%5B%5D=winterDriving&eventClassifications%5B%5D=flooding&_=' + Date.now()]
        },
        LA: {
            data(res, index) {
                let resultText = [res];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = ['(resultObj[i].LanesAffected).replace(/ +(?= )/g, "") == ("All Lanes Closed")'];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesLA.push(new Promise((resolve, reject) => {
                    advisoriesLA.push({
                        state: ['LA', 'Louisiana'],
                        id: obj.ID,
                        popupType: 0,
                        title: obj.RoadwayName,
                        lon: obj.Longitude,
                        lat: obj.Latitude,
                        type: obj.EventType,
                        keyword: ['roadwork'], //keywords for roadwork/construction
                        desc: obj.Description,
                        time: moment(new Date(obj.LastUpdated * 1000)).format('LLL'),
                        link: ''
                    });
                    resolve();
                }))
            },
            URL: ['http://scripts.essentialintegrations.com/LA']
        },
        MD: {
            data(res, index) {
                let resultText = [res.features];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesMD.push(new Promise((resolve, reject) => {
                    advisoriesMD.push({
                        state: ['MD', 'Maryland'],
                        id: obj.attributes.OBJECTID,
                        popupType: 0,
                        title: obj.attributes.Jurisdiction,
                        lon: obj.attributes.Longitude,
                        lat: obj.attributes.Latitude,
                        type: obj.attributes.typeSummary,
                        keyword: ['Construction'], //keywords for roadwork/construction
                        desc: obj.attributes.ClosureSummary,
                        time: moment(new Date(obj.attributes.EditDate)).format('LLL'),
                        link: ''
                    });
                    resolve();
                }))
            },
            URL: ['https://geodata.md.gov/appdata/rest/services/SHA_RoadClosure/RoadClosureActive/MapServer//0/query?where=1%3D1&outFields=*&outSR=4326&f=json']
        },
        MI: {
            data(res, index) {
                let resultText = [res, res];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = ['(resultObj[i].type == "Total")', true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                switch (index) {
                    case 0:
                        promisesMI.push(new Promise((resolve, reject) => {
                            advisoriesMI.push({
                                state: ['MI', 'Michigan'],
                                id: "00",
                                popupType: 0,
                                title: obj.county,
                                lon: obj.description.match(/(?<=lon=)[\s\S]*(?=&zoom)/)[0],
                                lat: obj.description.match(/(?<=lat=)[\s\S]*(?=&lon)/)[0],
                                type: "Construction",
                                keyword: ['Construction'], //keyword for roadwork/construction
                                desc: obj.description.match(/(?:(?!<).)*/),
                                time: moment(new Date(obj.startDate)).format('LL'),
                                link: ''
                            });
                            resolve();
                        }))
                        break;
                    case 1:
                        promisesMI.push(new Promise((resolve, reject) => {
                            advisoriesMI.push({
                                state: ['MI', 'Michigan'],
                                id: "",
                                popupType: 0,
                                title: obj.county,
                                lon: obj.location.match(/(?<=lon=)[\s\S]*(?=&zoom)/)[0],
                                lat: obj.location.match(/(?<=lat=)[\s\S]*(?=&lon)/)[0],
                                type: "Incident",
                                keyword: ['Construction'], //keyword for roadwork/construction
                                desc: obj.location.match(/(?:(?!<).)*/),
                                time: moment(new Date(obj.reported)).format('LLL'),
                                link: ''
                            });
                            resolve();
                        }))
                }
            },
            URL: ['https://mdotjboss.state.mi.us/MiDrive//construction/list/loadConstruction', 'https://mdotjboss.state.mi.us/MiDrive//incident/list/loadIncidents']
        },
        NC: {
            data(res, index) {
                let resultText = [res.features];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesNC.push(new Promise((resolve, reject) => {
                    advisoriesNC.push({
                        state: ['NC', 'North Carolina'],
                        id: obj.attributes.OBJECTID,
                        popupType: 0,
                        title: obj.attributes.CountyName,
                        lon: obj.attributes.Longitude,
                        lat: obj.attributes.Latitude,
                        type: obj.attributes.IncidentType,
                        keyword: ['Construction', 'Emergency Road Work', 'Night Time Construction', 'Weekend Construction'], //keywords for roadwork/construction
                        desc: obj.attributes.Reason,
                        time: moment(new Date(obj.attributes.LastUpdateUTC)).format('LLL'),
                        link: obj.attributes.DriveNCLink
                    });
                    resolve();
                }))
            },
            URL: ['https://services.arcgis.com/NuWFvHYDMVmmxMeM/ArcGIS/rest/services/NCDOT_TIMSIncidents/FeatureServer/0/query?where=Condition+%3D+%27Road+Closed%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=']
        },
        NJ: {
            data(res, index) {
                let resultText = [res.Data.features];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesNJ.push(new Promise((resolve, reject) => {
                    setTimeout(function () { resolve() }, 4000);
                    getFeed(config.NJ.detailURL[0] + obj.properties.EventID, async function (result) {
                        var eventObj = JSON.parse(result.responseText).Data;
                        if (((eventObj[0].FullText.toUpperCase()).includes("ALL LANES CLOSE") || (eventObj[0].FullText.toUpperCase()).includes("RAMP CLOSE")) && ((eventObj[0].FullText).includes("NYSDOT") != true)) {
                            advisoriesNJ.push({
                                state: ['NJ', 'New Jersey'],
                                id: eventObj[0].markerId,
                                popupType: 0,
                                title: eventObj[0].County,
                                lon: eventObj[0].Longitude,
                                lat: eventObj[0].Latitude,
                                type: eventObj[0].CategoryName,
                                keyword: ['Construction', 'ScheduledConstruction'], //keywords for roadwork/construction
                                desc: eventObj[0].FullText,
                                time: moment(new Date(eventObj[0].LastUpdateDate_String)).format('LLL'),
                                link: ''
                            });
                        }
                        //resolve();
                    });
                }));
            },
            URL: ['https://511nj.org/API/client/Map/getEventData'],
            detailURL: ['https://511nj.org/API/client/Map/getEventPopupData?EventId=']
        },
        NV: {
            data(res, index) {
                let resultText = [res.d];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesNV.push(new Promise((resolve, reject) => {
                    let unix = obj.LastUpdate.replace(/\\\//g, "").replace("/Date(", "").replace(")/", "");
                    advisoriesNV.push({
                        state: ['NV', 'Nevada'],
                        id: obj.ID,
                        popupType: 0,
                        title: obj.Facility,
                        lon: obj.Lon,
                        lat: obj.Lat,
                        type: obj.CategoryName,
                        keyword: ['Construction'], //keywords for roadwork/construction
                        desc: obj.Description,
                        time: moment(new Date(parseInt(unix))).format('LLL'),
                        link: ''
                    });
                    resolve();
                }))
            },
            URL: ['http://scripts.essentialintegrations.com/NV']
        },
        NY: {
            data(res, index) {
                let resultText = [res];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = ['((NotNY.includes(resultObj[i].RegionName) == false && resultObj[i].EventType != "transitMode" && resultObj[i].EventSubType != "Capacity related") && (resultObj[i].EventType == "closures" || (resultObj[i].EventType != "closures" && resultObj[i].LanesAffected == "all lanes" && (resultObj[i].LanesStatus == "closed" || resultObj[i].LanesStatus == "blocked"))))'];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesNY.push(new Promise((resolve, reject) => {
                    advisoriesNY.push({
                        state: ['NY', 'New York'],
                        id: obj.ID,
                        popupType: 0,
                        title: obj.CountyName,
                        lon: obj.Longitude,
                        lat: obj.Latitude,
                        type: obj.EventType,
                        keyword: ['roadwork', 'transitMode', 'closures'], //keywords for roadwork/construction
                        desc: obj.Description,
                        time: moment(moment(obj.LastUpdated, "DD/MM/YYYY HH:mm:ss")).format('LLL'),
                        link: ''
                    });
                    resolve();
                }))
            },
            URL: ['http://scripts.essentialintegrations.com/NY']
        },
        OH: {
            data(res, index) {
                let resultText = [res.ConstructionMarkers];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = ['(resultObj[i].Status == "Closed")'];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesOH.push(new Promise((resolve, reject) => {
                    advisoriesOH.push({
                        state: ['OH', 'Ohio'],
                        id: obj.ID,
                        popupType: 0,
                        title: obj.District,
                        lon: obj.Longitude,
                        lat: obj.Latitude,
                        type: obj.Category,
                        keyword: ['Roadwork - Planned', 'Roadwork - Unplanned'], //keywords for roadwork/construction
                        desc: obj.Description,
                        time: moment(new Date(obj.StartDate)).format('LL'),
                        link: ''
                    });
                    resolve();
                }))
            },
            URL: ['https://api.ohgo.com/roadmarkers/TrafficSpeedAndAlertMarkers']
        },
        OR: {
            data(res, index) {
                let resultText = [res.features, res.features, res.features];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true, 'resultObj[i].attributes.comments.includes("clos")', 'resultObj[i].attributes.tmddOther.includes("clos")'];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                switch (index) {
                    case 0:
                        let x, y;
                        var lonlat = obj.geometry.paths[0][0];
                        promisesOR.push(new Promise((resolve, reject) => {
                            x = obj.geometry.paths[0][0].toString().split(",")[0];
                            y = obj.geometry.paths[0][0].toString().split(",")[1];
                            advisoriesOR.push({
                                state: ['OR', 'Oregon'],
                                id: obj.attributes.OBJECTID,
                                popupType: 0,
                                title: obj.attributes.FROM_TO,
                                lon: x,
                                lat: y,
                                type: obj.attributes.CLOSURE_EFFECT,
                                keyword: ['Street'], //keywords for roadwork/construction
                                desc: obj.attributes.FROM_TO + " - " + obj.attributes.REMARKS,
                                time: moment(new Date(obj.attributes.LAST_EDITED_DATE)).format('LLL'),
                                link: ''
                            });
                            resolve();
                        }))
                        break;
                    case 1:
                        promisesOR.push(new Promise((resolve, reject) => {
                            advisoriesOR.push({
                                state: ['OR', 'Oregon'],
                                id: obj.attributes.incidentId,
                                popupType: 0,
                                title: obj.attributes.locationName,
                                lon: obj.attributes.startLongitude,
                                lat: obj.attributes.startLatitude,
                                type: obj.attributes.type,
                                keyword: ['ROADWORK'], //keywords for roadwork/construction
                                desc: obj.attributes.comments + " <br> " + obj.attributes.beginMarker + " to " + obj.attributes.endMarker,
                                time: moment(new Date(obj.attributes.lastUpdated)).format('LLL'),
                                link: ''
                            });
                            resolve();
                        }))
                        break;
                    case 2:
                        promisesOR.push(new Promise((resolve, reject) => {
                            advisoriesOR.push({
                                state: ['OR', 'Oregon'],
                                id: obj.attributes.incidentId,
                                popupType: 0,
                                title: obj.attributes.locationName,
                                lon: obj.attributes.startLongitude,
                                lat: obj.attributes.startLatitude,
                                type: obj.attributes.type,
                                keyword: ['EVENT'], //keywords for roadwork/construction
                                desc: obj.attributes.tmddOther + " <br> " + obj.attributes.beginMarker + " to " + obj.attributes.endMarker,
                                time: moment(new Date(obj.attributes.lastUpdated)).format('LLL'),
                                link: ''
                            });
                            resolve();
                        }))
                }
            },
            URL: ['https://services.arcgis.com/kIA6yS9KDGqZL7U3/ArcGIS/rest/services/RoadWork/FeatureServer/1/query?where=objectid+like+%27%25%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=true&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=true&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=', 'https://tripcheck.com/Scripts/map/data/INCD.js?dt=1607132941398', 'https://tripcheck.com/Scripts/map/data/EVENT.js?dt=1607134261397']
        },
        PA: {
            data(res, index) {
                let resultText = [res, res.features];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = ['(resultObj[i].LaneStatus == "closed") || (resultObj[i].LaneStatus == "ramp closure")', true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                switch (index) {
                    case 0:
                        let status = obj.LaneStatus;
                        let x, y;
                        if (status != "ramp closure") {
                            x = obj.FromLocLatLong.split(",")[1];
                            y = obj.FromLocLatLong.split(",")[0];
                        } else {
                            x = obj.IncidentLocLatLong.split(",")[1];
                            y = obj.IncidentLocLatLong.split(",")[0];
                        }
                        promisesPA.push(new Promise((resolve, reject) => {
                            advisoriesPA.push({
                                state: ['PA', 'Pennsylvania'],
                                id: obj.EventID,
                                popupType: 0,
                                title: obj.CountyName,
                                lon: x,
                                lat: y,
                                type: obj.EventType,
                                keyword: ['roadwork', 'bridge outage'], //keywords for roadwork/construction
                                desc: obj.Description,
                                time: moment(new Date(obj.LastUpdate)).format('LLL'),
                                link: ''
                            });
                            resolve();
                        }))
                        break;
                    case 1:
                        var originShift = 2.0 * Math.PI * 6378137.0 / 2.0;
                        var lon = (obj.geometry.x / originShift) * 180.0;
                        var lat = (obj.geometry.y / originShift) * 180.0;
                        lat = 180.0 / Math.PI * (2.0 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0);
                        var timing;
                        if (obj.attributes.END_DATE == null) {
                            timing = moment(new Date(obj.attributes.START_DATE)).format('LL');
                        } else {
                            timing = moment(new Date(obj.attributes.START_DATE)).format('LL') + ' to ' + moment(new Date(obj.attributes.END_DATE)).format('LL');
                        }
                        if (obj.attributes.START_TIME != null) {
                            timing = timing + '<br>' + obj.attributes.START_TIME + ' to ' + obj.attributes.END_TIME;
                        }
                        promisesPA.push(new Promise((resolve, reject) => {
                            advisoriesPA.push({
                                state: ['PA', 'Pennsylvania'],
                                id: obj.attributes.GlobalID,
                                popupType: 0,
                                title: 'HARRISBURG',
                                lon: lon,
                                lat: lat,
                                type: 'Closure',
                                keyword: ['Closure'], //keywords for roadwork/construction
                                desc: obj.attributes.STREET_NAME + ' between ' + obj.attributes.STREET_FROM + ' and ' + obj.attributes.STREET_TO + '<br>' + obj.attributes.REASON_FOR_CLOSURE + '<br>' + timing,
                                time: moment(new Date(obj.attributes.EditDate)).format('LLL'),
                                link: ''
                            });
                            resolve();
                        }))
                }
            },
            URL: ['http://scripts.essentialintegrations.com/PA', 'https://services5.arcgis.com/9n3LUAMi3B692MBL/arcgis/rest/services/Street_Closures_for_GIS_2017/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&outSR=102100&resultOffset=0&resultRecordCount=2000']
        },
        WA: {
            data(res, index) {
                let resultText = [res];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = ['(resultObj[i].EventCategory == "Closure" || resultObj[i].EventCategory == "Construction" || resultObj[i].EventCategory == "Bridge")'];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                let county;
                if (obj.County == null) {
                    county = obj.Region;
                } else {
                    county = obj.County;
                }
                let unixtime = parseInt(obj.LastUpdatedTime.replace("/Date(", "").replace(")/", "").split("-")[0]);
                promisesWA.push(new Promise((resolve, reject) => {
                    advisoriesWA.push({
                        state: ['WA', 'Washington'],
                        id: obj.AlertID,
                        popupType: 0,
                        title: county,
                        lon: obj.StartRoadwayLocation.Longitude,
                        lat: obj.StartRoadwayLocation.Latitude,
                        type: obj.EventCategory,
                        keyword: ['Construction', 'Closures'], //keywords for roadwork/construction
                        desc: obj.HeadlineDescription,
                        time: moment(new Date(unixtime)).format('LLL'),
                        link: ''
                    });
                    resolve();
                }))
            },
            URL: ['http://scripts.essentialintegrations.com/WA']
        },
        WI: {
            data(res, index) {
                let resultText = [res];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = ['(resultObj[i].EventType == "roadwork" || resultObj[i].EventType == "closures" || resultObj[i].EventType == "accidentsAndIncidents")'];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                let linkvar = '';
                let eText = '';

                let addObj = function()
                {
                    if (obj.PlannedEndDate == null || obj.PlannedEndDate > moment().unix())
                    {
                        promisesWI.push(new Promise((resolve, reject) => {
                            advisoriesWI.push({
                                state: ['WI', 'Wisconsin'],
                                id: obj.ID,
                                popupType: 0,
                                title: obj.County,
                                lon: obj.Longitude,
                                lat: obj.Latitude,
                                type: obj.EventType,
                                keyword: ['roadwork', 'closure'], //keywords for roadwork/construction
                                desc: eText + ': ' + obj.Description,
                                startTime: moment.unix(obj.StartDate).format('LLL'),
                                plannedEndTime: moment.unix(obj.PlannedEndDate).format('LLL'),
                                time: moment.unix(obj.LastUpdated).format('LLL'),
                                link: linkvar,
                                recurrence: obj.Recurrence
                            });
                            resolve();
                        }))
                    }
                };

                if (obj.EventType == 'closures')
                {
                    linkvar = 'https://511wi.gov/map#ConstructionClosures-' + obj.ID.replace(' ', '%20');
                    new Promise((resolve, reject) => {
                        getFeed('https://511wi.gov/map/data/ConstructionClosures/' + obj.ID.replace(' ', '%20'), function (result) {
                            let resultObj = [];
                            resultObj = JSON.parse(result.responseText);
                            eText = resultObj.details.detailLang1.eventDescription + ' on ' + resultObj.location.linkDesignator + ' at ' + resultObj.location.crossStreetName
                            resolve();
                        });
                    }).then((result) => addObj());
                }
                else if (obj.EventType == 'accidentsAndIncidents')
                {
                    linkvar = 'https://511wi.gov/map#Incidents-' + obj.ID.replace(' ', '%20');
                    addObj();
                }
                else
                {
                    addObj();
                }
            },
            URL: ['http://scripts.essentialintegrations.com/WI']
        },
        WV: {
            data(res, index) {
                let resultText = [res.changes["com.orci.opentms.web.public511.components.plannedevent.shared.data.PlannedEventBean"].changes];
                return (resultText[index]);
            },
            filter(index) {
                let filtertext = [true];
                return (filtertext[index]);
            },
            scheme(obj, index) {
                promisesWV.push(new Promise((resolve, reject) => {
                    advisoriesWV.push({
                        state: ['WV', 'West Virginia'],
                        id: obj.entity.dataGatewayId,
                        popupType: 0,
                        title: obj.entity.routeName,
                        lon: obj.entity.x,
                        lat: obj.entity.y,
                        type: 'Construction',
                        keyword: ['Construction'], //keywords for roadwork/construction
                        desc: obj.entity.message,
                        time: moment(new Date(obj.entity.startTime.millis)).format('LLL'),
                        link: ''
                    });
                    resolve();
                }))
            },
            URL: ['http://scripts.essentialintegrations.com/WV']
        }
    };
})();
