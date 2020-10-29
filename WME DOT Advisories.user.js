// ==UserScript==
// @name         WME DOT Advisories
// @namespace    https://greasyfork.org/en/users/668704-phuz
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @version      1.09
// @description  Overlay DOT Advisories on the WME Map Object
// @author       phuz
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @require      http://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require      https://raw.githubusercontent.com/tristen/tablesort/gh-pages/dist/tablesort.min.js
// @require      https://raw.githubusercontent.com/tristen/tablesort/gh-pages/dist/tablesort.number.min.js
// @require      https://raw.githubusercontent.com/tristen/tablesort/gh-pages/dist/tablesort.date.min.js
// @require      https://momentjs.com/downloads/moment.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_fetch
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/hls.js@latest
// @connect      511pa.com
// @connect      deldot.gov
// @connect      511ny.org
// @connect      511nj.org
// @connect      rehostjson.phuz.repl.co
/* global OpenLayers */
/* global W */
/* global WazeWrap */
/* global $ */
/* global I18n */
/* global _ */
// ==/UserScript==

let DEDOTLayer;
let NJDOTLayer;
let NYDOTLayer;
let PADOTLayer;
let WADOTLayer;
var settings;
var newZIndex;
const DEIconC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NTZCOTQ4MEMxM0FFNDExOTJCNzgxMEFBMkM5Q0QzRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRjU0MDFBMUJBMEYxMUU1OERGQ0YxMTRGNzU2OUVFMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRjU0MDFBMEJBMEYxMUU1OERGQ0YxMTRGNzU2OUVFMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1LjEgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkYwRjVFQTIwMDlCQUU1MTE4NEU2OTRCNTE0QTVGRkIzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjY1NkI5NDgwQzEzQUU0MTE5MkI3ODEwQUEyQzlDRDNFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+iRjjNgAABVBJREFUeNqsVwlsVFUUPX+Z+Z1OoaWFSqFaU0hYBSSiCdYQhaRKNdFAUlRcMAFL1ABBESMouEYxwTSxRutWIkbBqKQEwxZoWKKGrcoiAqKsBStLO+1s/8/zvP+nzLTzZzpRX+a00+n999x391GEEOh5xOXTsM7+Amgq0px8ojT++wJxjgi6SsZiUIw8aEPuABTl2se6m6z560Z0rpoNJcdI/ngg8QAxlRhFFBNSIEC0ED8R3xIbiEhCWRjqwBHIW9zMi3gyE9M0+xW3UEovJBZAkIyKhEUvJRxVQNkCxaMNp+JH+fcBYhmxzlGldLtpL8TXDBjEHw3EFEQdT6qDxkAfUgG1ZDQUf6ETltN7YZ7YCfH3GZqpj6MB31F0BbGYOmLOLbInlq7cZLs1FIR243gYdy+FPoqe1rxAOADr1D5o46udvAj8heiPDQhvfovvWwGv7znbG8AcN+Wu2aNoHmnix12knomPwz+/CfqY+x1SntC65xF4ZZJNZj+TNwDeyc/CP2871ME3Mcq2h2YT87Imti4enUXv3GuT3vogfDM/5Q3yEgLBK4juXwtB82zipMpQS0bBX7Meav9yJpadY6/TrGE93Z3iatHW0iey+6OXZT6oxUOQU/1earlZURiVLzo3ZalAmHyTyFil3w3ImfE+OuuqZD35IWJLyTuzuxJam4xwU231lRqIK3MhIjvqxH85HR/cZ+tpW5gXsM4fHpTMk3Jj61hTpSwVtV8x9LHTUuPA7A6ufdpJIJWPR8PQym6BMXVZiqh3wiMwmxshOgJ+83hThXfgiDXurjYjitVyZKx8q8ly6VOcGv/fdyGy/RMnO2TYLL6Ob4O34kkofUu6yWplE1hy+Yi1X4V1cvftqKhZ45pcInTVJzovDXDidL1rjUWPbISSmwu1oAhqPlFYxBDS5mNNqdXh70/ZQrvZiFB7QYbkkhIxJV5TrsRG5RIYUxZ170Yxwfbqd6lL1UHc82mJFU9uWPH6A7YJ7RdSFUU6IIJXaZOW3DIdk9s7oRQMduLe9Rll6UVHty//YvobG3mWet3w/VbLyeGxlkN2d4KRqN/w98sR3vIub5fbs8AgwiHkPrEa+rjpCUecP8gkvGQ7Ryu9eU/GBqKPvKfRfqj1T5hHt8QVHOLE2oTogW/IEeWrsweCLOUIWP8wf9vG/n3KyQfZZEyORZ8vpA+dtCMz8eiqzWqfvq2yG0W2vuPcdP0SdLxdSWNO0HS6OWalgNMJ5uGNCLx5Fw38mo3gDKJ7v4KiK1AKy7aoJSP/yNi51KLyVs/46vrIzvoXzGO7EN70BnKmrYT3zvnJiZJporEiShH8fBZj3OYsE5pe2/NZ1+mklU+sFTvq5yiGURRuXGqXhLeiBtmeYMPDvD3DlOOTiwB9L7aix6ajpllX5Ebxmm2lpiP05VyEeAPb1RmOxfh2rLiNg+MLh5S0xCKpMct5bFtXRzwEVZsAbw4T5zNEDzZyHldBHzYZ6oChHPq5EJ2XETvXDPPQBibWdrJHu0jlWUnscWPItAjImSb9u1NWoVQmQm2I/LDKhqLzUZWJZkWYucIJoYcrmHaN9DCxPJ3y3rJlH/FMQlrnGPTZkCFwTDdY1z65cSQnX8D2FtDxb4kR30Tq3BfCrkmRcqSnmjMpVbNM1AXE1ixlXyJW9yaULbGM94zebsHzIfFqNgpVZH84+bmHAT+n+f/auIvxfxPLw8UZVS7kco9+DCkzK/1xLyc52S3YpZKGXH6NWU+MI+qJp+RMcO8qMae2syGWLVIbPIIj0Uhn8FlCLmTT498Y0t/UjLLZlKd8jflHgAEAjYU+RhKpTDQAAAAASUVORK5CYII=';
const DEIconSchRestriction = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowNTdDRTI5RjhFOENFNTExQkIwQkQ3QjFGMjA1NkNGMiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0MzMwRkNCMUJBMDcxMUU1OTE5RjkwMEI5NThDNEVCMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0MzMwRkNCMEJBMDcxMUU1OTE5RjkwMEI5NThDNEVCMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1LjEgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjI4Q0M2MTJGNEVCOUU1MTE4NEU2OTRCNTE0QTVGRkIzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjA1N0NFMjlGOEU4Q0U1MTFCQjBCRDdCMUYyMDU2Q0YyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+YotOJgAABWdJREFUeNqcVwlsFFUY/nY7e7S0tPbQSkstUUu01NBWSzQKIjQaUbAxapAEj5g0KtEYRdEIeETjFYRglEDEIBgleIBnrGgjQY5C01SKFmrTi5ZSethjt7vt7o7fmzfb3ens0fqSL7Mz7/3/995/vX8tqqpCG2oA+LcRCPgAC+KNDCJZ/z0MW0o/rLbYEhYrkJgtn+J1gnh8CNhXBLguAFaTmINYSiwjridyiCR9zgXF2QmLcoK/vyd+I8YM0oLCMRO4pwZwZmqfFMOsfxTweScTP0QLrOV0Ifx8ExAWSdBn/UiD6s3hexnxJL/8SbxDfGYgVr3SqvoIIxbarPIhTX0psZ1YAZ+cQnYJMOs2IItPJZFu4S58LqCHJ+n8FehtFLLXcQN7uLqCqCT6pHpSWSyRiA0jj/iBO52nkeYtAkpepoGXTOwK395CUg/N9wdw9WpugtZt+w6ofR3orgfsuJerrtTd0zWZwBqBNIXYr5EKy9z4GnB3NUmXhkhPchOth4FzJ4Fjz+ma7MAcclUcAeY/zpjRvs4nvg6Lh5jEbxPFmi8XbuFJ18MQ5kNNQP37MtycRMM2oL8+NJ9Ajps/ZAg+GyRfQLwRj7iYHJWaQNFjQOFT5m0dfx5wu4HyvTzdMRltR58xr1vwHi1QDs1VwBqiMAqxRTh/DfVYMZNxVfaWWVlnFdC0X/gPSJ8HZJby5PRMC13R8qV5/U2budYholqh7ifCLRci9vYnM5fv0ExcwGBxZBiViOAJ+lOkxxjzfnxYFhyhpWadjPDwkXYtcMWd8tR+7zL43E4z8cDpAnjcsyAKUP4K8+7/+gg4f0rmgQg6Ty/JB6nULb9dbAZObTLLzamQB/W68zDcfJWZ2N2Vq+0skRUmtcAoPNot00QJKwieHoIp6tMrn9hw3bvASKtRNp3V0GYRoWDByLkcM7Ewg9BhI7Et2Shcu4EVuS9UrVT9xN5+efqgplGavuZFo6w9jRu2Sxm/22EmtqeOaCYRvgz4QoK9LMGnd8qAUsPKTgcD7ewu42bEqc9+QZdUG2MjePHY00bMxDNy26lQhYencHeHBEVA+f1m3xU9DZRuCEZtGJGQWctv+uZH2hmElFcsPiTPbjcTp81thsPRDg8FLhyW3/5hnW87FLmw9taxNLJcBgLGa1Ss7aoFGnfoKVgto1qxNSE5v9VM7MgYReo1P2m7b9rNxcJfL0il6iSIb0c3AlWP0hrj5nmhtfZVEbDM733yPb3oG8aOz0ycwNumdP02+iyAjt9Ziw/IPLQ5IyORSIoypxAZxfLUvU2CxY3SV3ZogRvxdkq6vJ7EuxBQH8Hxl4C7fuEKLg54p9KVhNVDEg+dAX5cLoMvgE1IcBjyzEgsAkLFOn4tx2BHLqru56XGpiIlH9MaffT/wVVMtyHBUEfiN0N5F/126iH5aqaGDxfZTHzFy6X586kRBujvhq28VBcy7zsFaT91rRIZPnlptEagmgKVJP8YrvPAzw/yPuZVN/dhdiC3ss2bLe9frfWhzuEW5jXdcuYTZkS91KrAQx0P8NffkQiUGPvfScEU2mSzZpdOcfETTvpvBiuf4xIZwqKCuXg6r35ZyGZzjFMr+TwYTbkSx3hb9PZu68RK0e4MNIfSKohQdyvMKkgPxIy/KXjuA63TDPYTwQ5T0Z9WQ4MyQCyPRzpVYjE+1bvGwRhrOojbo5pX/X/E0LpONjxEm2nGjwbmwBLihFYeI0H1x/CxGpdc/FtYTIg+p0S/FA6hbON9yCzuiSol9GbdECu41Ml5Hmm06H9n9opbmaddiZzFLmQvmlaNCf13kn0Xb5wjUy2PNm2nKg15GYuMM2taxP8JMAC5wMrd7FP1/wAAAABJRU5ErkJggg==';
const DEIconSchClosure = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAoCAYAAADpE0oSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTYxOTU5RkJGMkQ3MTFFNkI5NERERDM2Qzg4NzcwRUYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTYxOTU5RkNGMkQ3MTFFNkI5NERERDM2Qzg4NzcwRUYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNjE5NTlGOUYyRDcxMUU2Qjk0REREMzZDODg3NzBFRiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNjE5NTlGQUYyRDcxMUU2Qjk0REREMzZDODg3NzBFRiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuSU594AAAfTSURBVHja5Fh7cJTV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';
const Incident = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA/ppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjVEMjA4OTI0OTNCRkRCMTE5MTRBODU5MEQzMTUwOEM4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjk4MDFDMjUwNzIzRDExRTNBQTczRjkyOTZEQ0IyOTY0IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk4MDFDMjRGNzIzRDExRTNBQTczRjkyOTZEQ0IyOTY0IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIElsbHVzdHJhdG9yIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ1dWlkOmFiMzczNzVkLWIwYTYtNDRjNC04OTE4LWU4M2ZiOTRhOGY4NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpjMjUyYWZlMC1mMjU0LWY5NDMtOGZiZi0wMTc3Mzc1ZWEzYzYiLz4gPGRjOnRpdGxlPiA8cmRmOkFsdD4gPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5JbmNpZGVudHNfb3V0bGluZWQ8L3JkZjpsaT4gPC9yZGY6QWx0PiA8L2RjOnRpdGxlPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pmcc3z4AAASdSURBVHja7FdLaFxVGP7OPfc1M5lMJ5M0Gk0nNdE+sogPLNG2KNaFUksqlkAjSGtcCBJUWgouhErAUOhCwb2uXJQupCtF0I102SrEUsFNkRaxJJ3MTGbu+/j/J2lnKp04HdNkY+AnZ875/u9853/ce65QSmEz/wxs8t//AjZdgDkytL1j5whIaRKgvuERCIH9UDjHpsedRqATJwE8Yimcn5LuVv79deztEQJPU0Nf35AILCZq7lXX3jqds8DGY5574Cmgk6OS4PCoJaamcvSjO9HGY57jtQcqwFPot1V85lhByPHptzBw7jttz9H4eK8hnSQ+4xPmfjhlz5YtbQHprChH6vRrTuXQqddfgP3+HGSuANnVDYw9ix3XL+G3X68UfgkduFJ8L9Y7AvUYL+7MipMndig4eQdKNOqXx07exomdCoxh7LqmIFRwbYHP3t1uYHevgXq9CgRNre/X9ByvMYax7LN+EVA4/XKfMTbRJ3GzYiKs+lCh31gOA4Tlul5jDGPZZ10ERAp7C7aYmX7YgvIl6p4Fv+IjCcJGfZAAvxroNcYwln3Y978KkLVEfXK0z0yPmAbKNYEglAjKAZ06bIpAhKASIvBXMIxlH/Zljo4EcBUvRsl7e7vkgYMZC/Ua554E0An98j8iEFAEyh6CwNQYxrIP+zKH6ERATanhHtP46M2sgxydurRMdeeRAM+Ed8tD4gcNAV6g53zf1BjGsg/7Mgdz3ZcAeqbTo158fiRtP/SMsPAnEYYU3sAz6L+EV/IQeY0ijFnAko+I1lYwhvZhX+ZgLuZsW0BVqalRUx6ckA7lVMH3WMCqhSSEU+A3UhBTOgIWEBp3cOzDvszBXMzZlgCiHcwL8ekbho1UYIAKHoqinfirFlIaKAJJEDfVQKTnYlq7jWMf9mUO5mJO5l5TgNKXDDW3H/bAk7GFcqD0hnGTJTGFWatqdiRRVIS8dheWjDmYizmZW60lgACHt0EemVAOkdFJknubYbtY+nn+jl+ZxobltsQzF3MyN+9xV7cNF4f0YahVBkKlLp6UmeI+Kp4qvX5afjEkCjLloO/QK/rnXxe+pU6gqBiiZUt30Vl/UiHOxsvXLCGeJ+4b4nYEeHBLqVMHLKu4zzWROAmodmC2MEP4SA32Izu6W1u62K/nWuGZizmZm/fgvUTzlWw5US8Nm3JmMuMgQzOlVj2jn3pUSl0mRmY/RveecT2X2TWMq++8Te0QQtj39uSSzdKuk5aD+Uoy80cUX8gY4geTaiRPX2ezk92WMZaTWIiTNV9jyo8gM1m4xcZt2t1WRLrgIi6XIdzW10x6gGNMSkwKyzi7EM/S3pdlKpv7YCJvHf/wURvKVrApXKm1LC1h+SU4jgV7eBddk+qof/Mloks/IpNPI+W29nU5fY7CU90GbgRq8Eo9LplpQ4w/QZeaJBVhgaIr2rnKOGlUzn8BZ/7iynXg6mUYhfRqoP/lzU7p7aUs8Z7pJTEuHisOHe1z8FUPvUljhfY+lVkl9VdSXVrp5QyxUWjR5pe2FBCLVC43fRwTj1Mb0kVypBbrLtqQb3XqYkGZhCPw+98CDACt/EZVMWT0ogAAAABJRU5ErkJggg==';
const Roadwork = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA/VpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjVEMjA4OTI0OTNCRkRCMTE5MTRBODU5MEQzMTUwOEM4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkUzRjQ0OTg5NzIzOTExRTM4ODlCRkYwNDVGNDI0RjlEIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkUzRjQ0OTg4NzIzOTExRTM4ODlCRkYwNDVGNDI0RjlEIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIElsbHVzdHJhdG9yIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ1dWlkOmFkOTA4NmJkLTAzMGEtNDA0MS04ZTdiLWJhZGYwNWRmZDMzZiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplNDcyMTVk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';
const PLIcon = 'data:image/gif;base64,R0lGODlhFgAUANUAAOHh4t7e34iKj0dLU0VJUUhMVEpOVk1RWU9TW2xvdXF0enx/hZOVmcbHyVJWXVFVXFRYX1dbYl5iaTtASD5DSz1CSj9ETEFGTkNIUEVKUn6BhoSHjFpeZGBkamVpb2RobmpudGltc2ZqcG1xd2tvdaqsr0ZLUklOVU9UW3h8gdHS08nKy////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACwALAAAAAAWABQAAAZrQJZwSCwaj8ikcskkmTpMI2JSmUxSUaFjIhJCJlkhiHjJMD2YUDECVqKsVuJk4OYGSqeDcEJRTkUACgkrKgx8SgsTH0IcExgeh0oFbUICFo5MBpRCDVkbEyNDEw9hbAYSkWEaVQRhrq+wTEEAOw==';
const reportIcon = 'data:image/gif;base64,R0lGODlhFAAUALMAANcsLNgvL9g4OAMBAc5RUcZVVW1tbQAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAAgALAAAAAAUABQAAARdEKFDqz0y6zO695S2FUBpAkNliBNxmmnFHu6LXmtG2+iXbjWeiYDRuXw2IhAg+CSLkp1wCG31fB6A0jilLrva6g7r3EaDU7MVEGi72yX1mNwJj8CAgpiOFV/+FhIRADs=';
const DEAdvURL = 'https://tmc.deldot.gov/json/advisory.json';
const DESchURL = 'https://deldot.gov/json/str.json';
const NJURLList = 'https://511nj.org/API/client/Map/getEventData';
const NJURLDetail = 'https://511nj.org/API/client/Map/getEventPopupData?EventId=';
const NYURL = 'https://rehostjson.phuz.repl.co/NY';
const PAURL = 'https://rehostjson.phuz.repl.co/PA';
const WAURL = 'https://rehostjson.phuz.repl.co/WA';
const NotNY = ['Pennsylvania Statewide', 'New Jersey Statewide', 'Connecticut Statewide'];
const NJConstruction = ['Construction', 'ScheduledConstruction'];

(function() {
    'use strict';
    //Bootstrap
    function bootstrap(tries = 1) {
        if (W && W.loginManager && W.map && W.loginManager.user && W.model
            && W.model.states && W.model.states.getObjectArray().length && WazeWrap && WazeWrap.Ready) {
            console.log("WME DOT Advisories Loaded!");
            init();
            if (!OpenLayers.Icon) {
                installIcon();
            }

        } else if (tries < 1000) {
            setTimeout(function () {bootstrap(++tries);}, 200);
        }
    }
    //Build the Tab and Settings Division
    function init()
    {
        var $section = $("<div>");
        $section.html([
            '<div id="chkEnables">',
            '* The WME Refresh Button will fetch new advisory data.',
            '<table border=1 style="text-align:center;width:100%;padding:10px;">',
            '<tr><td colspan=2 style="text-align:center"><b>Enable</b></td><td style="text-align"><b>State</b></td><td width=30><b>Rpt</b></td></tr>',
            '<tr><td colspan=2 align=center><input type="checkbox" id="chkDEDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td align=center>DE</td><td><div class=DOTreport data-report="report" id="DOTDEPopup"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td colspan=2 align=center><input type="checkbox" id="chkNJDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td align=center>NJ</td><td><div class=DOTreport data-report="report" id="DOTNJPopup"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td colspan=2 align=center><input type="checkbox" id="chkNYDOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td align=center>NY</td><td><div class=DOTreport data-report="report" id="DOTNYPopup"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td colspan=2 align=center><input type="checkbox" id="chkPADOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td align=center>PA</td><td><div class=DOTreport data-report="report" id="DOTPAPopup"><img src=' + reportIcon + '></div></td></tr>',
            '<tr><td colspan=2 align=center><input type="checkbox" id="chkWADOTEnabled" class="WMEDOTAdvSettingsCheckbox"></td><td align=center>WA</td><td><div class=DOTreport data-report="report" id="DOTWAPopup"><img src=' + reportIcon + '></div></td></tr>',
            '</table>',
            '</div></div>'
        ].join(' '));
        new WazeWrap.Interface.Tab('DOT Advisories', $section.html(), initializeSettings);
    }
    getFeed("https://rehostjson.phuz.repl.co/public/CSS", function(result) {
        GM_addStyle(result.responseText);
    })
    //Build the State Layers
    function buildDOTAdvLayers(state) {
        eval(state.substring(0,2) + 'DOTLayer = new OpenLayers.Layer.Markers(' + state.substring(0,2) + 'DOTLayer)');
        eval('W.map.addLayer(' + state.substring(0,2) + 'DOTLayer)');
        eval(state.substring(0,2) + "DOTLayer.setZIndex(" + newZIndex + ")");
    }
    function getFeed(url,callback) {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                var result = response;
                callback(result);
            }
        });
    }
    function getDEDOT() {
        getDEDOTAdv();
    }
    //Get the DE Advisory JSON Feed
    function getDEDOTAdv(type) {
        getFeed(DEAdvURL, function(result) {
            var resultObj = JSON.parse(result.responseText).advisories;
            var i=0;
            while (i<resultObj.length) {
                if (type == "report") {
                    let table = document.getElementById("reportTable").getElementsByTagName('tbody')[0];
                    var row = table.insertRow(-1);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3);
                    cell1.innerHTML = '<div class="gotoPL" data-lat="' + resultObj[i].where.lat + '" data-lon="' + resultObj[i].where.lon + '"><img src=' + PLIcon + '></div>';
                    cell2.innerHTML = resultObj[i].where.location;
                    cell3.innerHTML = resultObj[i].where.county.name;
                    cell4.innerHTML = moment(new Date(resultObj[i].timestamp)).format('YYYY/MM/DD HH:mm');
                } else {
                    drawMarkers("DEAdv",resultObj[i].id,resultObj[i].type.name,resultObj[i].where.lon,resultObj[i].where.lat,"DEIconC",resultObj[i].where.location,resultObj[i].timestamp,resultObj[i].published.linkbackUrl);
                }
                i++;
            }
            getDEDOTSch(type);
        })
    }
    //Get the DE Schedule JSON Feed
    function getDEDOTSch(type) {
        getFeed(DESchURL, function(result) {
            var resultObj = JSON.parse(result.responseText);
            var i=0;
            while (i<resultObj.length) {
                if (resultObj[i].str.impactType == "Closure") {
                    if (type == "report") {
                        let table = document.getElementById("reportTable").getElementsByTagName('tbody')[0];
                        var row = table.insertRow();
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        var cell4 = row.insertCell(3);
                        cell1.innerHTML = '<div class="gotoPL" data-lat="' + resultObj[i].str.latitude + '" data-lon="' + resultObj[i].str.longitude + '"><img src=' + PLIcon + '></div>';
                        cell2.innerHTML = resultObj[i].str.title;
                        cell3.innerHTML = resultObj[i].str.county;
                        cell4.innerHTML = moment(new Date(resultObj[i].str.actualStartDate)).format('YYYY/MM/DD HH:mm');
                    } else {
                        drawMarkers("DESch",resultObj[i].str.strId,resultObj[i].str.title,resultObj[i].str.longitude,resultObj[i].str.latitude,"DEIconSch" + resultObj[i].str.impactType,resultObj[i].str.construction,resultObj[i].str.startDate,resultObj[i].str.releaseId);
                    }
                }
                i++;
            }
            if (type == "report") {
                reportWorker();
            }
        })
    }
    //Get the NJ Schedule JSON Feed
    function getNJDOT(type) {
        getFeed(NJURLList, function(result) {
            var resultObj = JSON.parse(result.responseText).Data.features;
            var length = resultObj.length;
            let advisories = [];
            var i = 0;
            for (let i = 0; i < length; i++) {
                if (["Incident", "Construction", "ScheduledConstruction", "Detour"].includes(resultObj[i].properties.CategoryName)) {
                    advisories.push(resultObj[i].properties.EventID);
                }
            }
            getNJDetails(type,advisories);
        })
    }
    function getNJDetails(type,advisories) {
        var promises = [];
        for (let i = 0; i < advisories.length; i++) {
            promises.push(new Promise((resolve,reject) => {
                getFeed(NJURLDetail + advisories[i], function(result2) {
                    var eventObj = JSON.parse(result2.responseText).Data;
                    if ((eventObj[0].FullText.toUpperCase()).includes("ALL LANES CLOSE") || (eventObj[0].FullText.toUpperCase()).includes("RAMP CLOSE"))
                    {
                        var icon;
                        switch(eventObj[0].CategoryName) {
                            case "Incident":
                                icon = "Incident";
                                break;
                            case "Detour":
                                icon = "Incident";
                                break;
                            case "Construction":
                                icon = "Roadwork";
                                break;
                            case "ScheduledConstruction":
                                icon = "Roadwork";
                                break;
                            default:
                                icon = "Incident";
                        }
                        if (type == "report") {
                            let table = document.getElementById("reportTable").getElementsByTagName('tbody')[0];
                            var row = table.insertRow(-1);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            var cell3 = row.insertCell(2);
                            var cell4 = row.insertCell(3);
                            cell1.innerHTML = '<div class="gotoPL" data-lat="' + eventObj[0].Latitude + '" data-lon="' + eventObj[0].Longitude + '"><img src=' + PLIcon + '></div>';
                            cell2.innerHTML = eventObj[0].FullText
                            cell3.innerHTML = eventObj[0].County
                            cell4.innerHTML = moment(new Date(eventObj[0].LastUpdateDate_String)).format('YYYY/MM/DD HH:mm');
                        } else {
                            drawMarkers("NJ",eventObj[0].markerId,eventObj[0].County + " - " + eventObj[0].CategoryName,eventObj[0].Longitude,eventObj[0].Latitude,icon,eventObj[0].FullText,eventObj[0].LastUpdateDate_String,"");
                        }
                    }
                    resolve(); //Let the Promise.all() know that we finished this dependency
                })
            }))
        }
        Promise.all(promises).then(function () {
            if (type=="report") { reportWorker(); } //Run the reportWorker after we've resolved all promises (ie, fetched the details of all pertinent report IDs)
        });
    }
    //Get the NY Event JSON Feed
    function getNYDOT(type) {
        getFeed(NYURL, function(result) {
            var resultObj = JSON.parse(result.responseText);
            var i=0;
            var icon;
            while (i<resultObj.length) {
                if (NotNY.includes(resultObj[i].RegionName) == false && resultObj[i].EventType != 'transitMode' && resultObj[i].EventSubType != 'Capacity related') { //skip anything not NY & transit notices & parking notices
                    if (resultObj[i].EventType == 'closures' || (resultObj[i].EventType != 'closures' && resultObj[i].LanesAffected == 'all lanes' && (resultObj[i].LanesStatus == 'closed' || resultObj[i].LanesStatus == "blocked"))) {
                        switch(resultObj[i].EventType) {
                            case "accidentsAndIncidents":
                                icon = "Incident";
                                break;
                            case "roadwork":
                                icon = "Roadwork";
                                break;
                            case "specialEvents":
                                icon = "Incident";
                                break;
                            case "closures":
                                icon = "Roadwork";
                                break;
                            case "transitMode":
                                icon = "Roadwork";
                                break;
                            case "generalInfo":
                                icon = "Roadwork";
                                break;
                            case "winterDrivingIndex":
                                icon = "Roadwork";
                                break;
                            default:
                                icon = "Incident";
                        }
                        if (type == "report") {
                            let table = document.getElementById("reportTable").getElementsByTagName('tbody')[0];
                            var row = table.insertRow(-1);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            var cell3 = row.insertCell(2);
                            var cell4 = row.insertCell(3);
                            cell1.innerHTML = '<div class="gotoPL" data-lat="' + resultObj[i].Latitude + '" data-lon="' + resultObj[i].Longitude + '"><img src=' + PLIcon + '></div>';
                            cell2.innerHTML = resultObj[i].Description;
                            cell3.innerHTML = resultObj[i].CountyName;
                            cell4.innerHTML = moment(moment(resultObj[i].LastUpdated,"DD/MM/YYYY HH:mm:ss")).format('YYYY/MM/DD HH:mm');
                        } else {
                            drawMarkers("NY",resultObj[i].ID,"",resultObj[i].Longitude,resultObj[i].Latitude,icon,resultObj[i].Description,resultObj[i].LastUpdated,"");
                        }
                    }
                }
                i++;
            }
            if (type == "report") {
                reportWorker();
            }
        })
    }
    //Get the PA Event JSON Feed
    function getPADOT(type) {
        getFeed(PAURL, function(result) {
            var resultObj = JSON.parse(result.responseText);
            var i=0;
            var icon;
            var x,y;
            while (i<resultObj.length) {
                if ((resultObj[i].LaneStatus == "closed") || (resultObj[i].LaneStatus == "ramp closure")) {
                    switch(resultObj[i].EventType) {
                        case "roadwork":
                            icon = "Roadwork";
                            break;
                        default:
                            icon = "Incident";
                    }
                    if (resultObj[i].LaneStatus != "ramp closure") {
                        x = resultObj[i].FromLocLatLong.split(",")[1];
                        y = resultObj[i].FromLocLatLong.split(",")[0];
                    } else {
                        x = resultObj[i].IncidentLocLatLong.split(",")[1];
                        y = resultObj[i].IncidentLocLatLong.split(",")[0];
                    }
                    if (type == "report") {
                        let table = document.getElementById("reportTable").getElementsByTagName('tbody')[0];
                        var row = table.insertRow(-1);
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        var cell4 = row.insertCell(3);
                        cell1.innerHTML = '<div class="gotoPL" data-lat="' + y + '" data-lon="' + x + '"><img src=' + PLIcon + '></div>';
                        cell2.innerHTML = resultObj[i].Description;
                        cell3.innerHTML = resultObj[i].CountyName;
                        cell4.innerHTML = moment(new Date(resultObj[i].DateTimeNotified)).format('YYYY/MM/DD HH:mm');
                    } else {
                        drawMarkers("PA",resultObj[i].EventID,resultObj[i].Facility,x,y,icon,resultObj[i].Description,resultObj[i].LastUpdate,"");
                    }
                }
                i++;
            }
            if (type == "report") {
                reportWorker();
            }
        })
    }
    //Get the WA Event JSON Feed
    function getWADOT(type) {
        getFeed(WAURL, function(result) {
            var resultObj = JSON.parse(result.responseText);
            var i=0;
            var icon;
            var county;
            while (i<resultObj.length) {
                if (resultObj[i].EventCategory == 'Closure' || resultObj[i].EventCategory == 'Construction' || resultObj[i].EventCategory == 'Bridge') {
                    switch(resultObj[i].EventCategory) {
                        case "Construction":
                            icon = "Roadwork";
                            break;
                        case "Closure":
                            icon = "Roadwork";
                            break;
                        case "Collision":
                            icon = "Incident";
                            break;
                        default:
                            icon = "Incident";
                    }
                    var unixtime = parseInt(resultObj[i].LastUpdatedTime.replace("/Date(","").replace(")/","").split("-")[0]);
                    let datetime = new Date(unixtime).toLocaleString();
                    if (resultObj[i].County == null) {
                        county = resultObj[i].Region;
                    } else {
                        county = resultObj[i].County;
                    }
                    if (type == "report") {
                        let table = document.getElementById("reportTable").getElementsByTagName('tbody')[0];
                        var row = table.insertRow(-1);
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        var cell4 = row.insertCell(3);
                        cell1.innerHTML = '<div class="gotoPL" data-lat="' + resultObj[i].StartRoadwayLocation.Latitude + '" data-lon="' + resultObj[i].StartRoadwayLocation.Longitude + '"><img src=' + PLIcon + '></div>';
                        cell2.innerHTML = resultObj[i].HeadlineDescription;
                        cell3.innerHTML = county;
                        cell4.innerHTML = moment(new Date(datetime)).format('YYYY/MM/DD HH:mm'); //moment(new Date(resultObj[i].DateTimeNotified)).format('YYYY/MM/DD hh:mm a');
                    } else {
                        drawMarkers("WA",resultObj[i].AlertID,"",resultObj[i].StartRoadwayLocation.Longitude,resultObj[i].StartRoadwayLocation.Latitude,icon,resultObj[i].HeadlineDescription,datetime,"");
                    }
                }
                i++;
            }
            if (type == "report") {
                reportWorker();
            }
        })
    }
    function reportWorker() {
        var elements = document.getElementsByClassName("gotoPL");
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('click', moveMap, false);
        }
        refreshReportTable();
    }
    function refreshReportTable() {
        var sort = new Tablesort(document.getElementById('reportTable'),{descending: true});
        sort.refresh();
    }
    function getReportData(id) {
        switch(id) {
            case "DOTDEPopup":
                popupdetails("Delaware");
                getDEDOTAdv("report");
                break;
            case "DOTNJPopup":
                popupdetails("New Jersey");
                getNJDOT("report");
                break;
            case "DOTNYPopup":
                popupdetails("New York");
                getNYDOT("report");
                break;
            case "DOTPAPopup":
                popupdetails("Pennsylvania");
                getPADOT("report");
                break;
            case "DOTWAPopup":
                popupdetails("Washington");
                getWADOT("report");
                break;
        }
    }
    //Generate the Advisory markers
    function drawMarkers(state,id,title,x,y,icontype,desc,timestamp,link) {
        var size = new OpenLayers.Size(20,20);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        var icon = new OpenLayers.Icon(eval(icontype),size);
        var epsg4326 = new OpenLayers.Projection("EPSG:4326"); //WGS 1984 projection
        var projectTo = W.map.getProjectionObject(); //The map projection (Spherical Mercator)
        var lonLat = new OpenLayers.LonLat(x,y).transform(epsg4326,projectTo);
        var newMarker = new OpenLayers.Marker(lonLat,icon);
        newMarker.desc = desc;
        newMarker.eventId = id;
        newMarker.title = title;
        newMarker.state = state;
        newMarker.timestamp = timestamp;
        newMarker.events.register('click',newMarker,popup);
        newMarker.location = lonLat;
        if (link != "-1" && state == "DESch") {
            newMarker.link = '<a href=https://deldot.gov/About/news/index.shtml?dc=release&id=' + link + ' target="_blank">';
        } else if (link == "-1" && state == "DESch") {
            newMarker.link = `<a href='javascript:alert("Sorry!  No publication available for this closure")'>`;
        } else {
            newMarker.link = link;
        }
        eval(state.substring(0,2) + "DOTLayer.addMarker(newMarker)");
    }
    function popup(evt) {
        $("#gmPopupContainer").remove ();
        $("#gmPopupContainer").hide ();
        var popupHTML;
        W.map.moveTo(this.location);
        switch(this.state) {
            case "DEAdv":
                this.timestamp = new Date(this.timestamp);
                popupHTML = (['<div id="gmPopupContainer" style="max-width:500px;margin: 1;text-align: center;padding: 5px">' +
                              '<a href="#close" id="gmCloseDlgBtn" title="Close" class="modalclose" style="color:#FF0000;">X</a>' +
                              '<table border=0><tr><td><div id="mydivheader" style="min-height: 20px;">' + this.title + '</div><hr class="myhrline"/>' +
                              'Updated: ' + this.timestamp.toLocaleString() + '<hr class="myhrline"/></td></tr>' +
                              '<tr><td>' + this.desc + '</td></tr>' +
                              '<tr><td><a href="' + this.link + '" target="_blank">DelDot Link</a></td></tr>' +
                              '</table>' +
                              '</div>'
                             ]);
                break;
            case "DESch":
                popupHTML = (['<div id="gmPopupContainer" style="max-width:500px;margin: 1;text-align: center;padding: 5px">' +
                              '<a href="#close" id="gmCloseDlgBtn" title="Close" class="modalclose" style="color:#FF0000;">X</a>' +
                              '<table border=0><tr><td><div id="mydivheader" style="min-height: 20px;">Scheduled Closure</div><hr class="myhrline"/>' +
                              '<tr><td><h4>' + this.title.toString() + '</h4><hr class="myhrline"/></td></tr>' +
                              '<tr><td>Period: ' + this.timestamp.replace(/ 12:00 AM/g,"") + '<hr class="myhrline"/></td></tr>' +
                              '<tr><td>' + this.desc + '</td></tr>' +
                              '<tr><td>' + this.link + 'DelDot Link</a></td></tr>' +
                              '</table>' +
                              '</div>'
                             ]);
                break;
            case "NJ":
            case "NY":
            case "PA":
                popupHTML = (['<div id="gmPopupContainer" style="max-width:500px;margin: 1;text-align: center;padding: 5px">' +
                              '<a href="#close" id="gmCloseDlgBtn" title="Close" class="modalclose" style="color:#FF0000;">X</a>' +
                              '<table border=0><tr><td><div id="mydivheader" style="min-height: 20px;"></div><hr class="myhrline"/>' +
                              '<tr><td><h4>' + this.title.toString() + '</h4><hr class="myhrline"/></td></tr>' +
                              '<tr><td>Time: ' + new Date(this.timestamp).toLocaleString() + '<hr class="myhrline"/></td></tr>' +
                              '<tr><td>' + this.desc + '</td></tr>' +
                              '</table>' +
                              '</div>'
                             ]);
                break;
            case "WA":
                popupHTML = (['<div id="gmPopupContainer" style="max-width:500px;margin: 1;text-align: center;padding: 5px">' +
                              '<a href="#close" id="gmCloseDlgBtn" title="Close" class="modalclose" style="color:#FF0000;">X</a>' +
                              '<table border=0><tr><td><div id="mydivheader" style="min-height: 20px;"></div><hr class="myhrline"/>' +
                              'Updated: ' + this.timestamp.toLocaleString() + '<hr class="myhrline"/></td></tr>' +
                              '<tr><td>' + this.desc + '</td></tr>' +
                              '</table>' +
                              '</div>'
                             ]);
        }
        $("body").append(popupHTML);
        //Position the modal based on the position of the click event
        $("#gmPopupContainer").css({left: document.getElementById("user-tabs").offsetWidth + W.map.getPixelFromLonLat(W.map.getCenter()).x - document.getElementById("gmPopupContainer").clientWidth - 10 });
        $("#gmPopupContainer").css({top: document.getElementById("left-app-head").offsetHeight + W.map.getPixelFromLonLat(W.map.getCenter()).y - (document.getElementById("gmPopupContainer").clientHeight / 2) });
        $("#gmPopupContainer").show();
        //Add listener for popup's "Close" button
        $("#gmCloseDlgBtn").click ( function () {
            $("#gmPopupContainer").remove ();
            $("#gmPopupContainer").hide ();
        });
        dragElement(document.getElementById("gmPopupContainer"));
    }
    function popupdetails(state) {
        $("#gmPopupContainer").remove ();
        $("#gmPopupContainer").hide ();
        var popupHTML;
        popupHTML = (['<div id="gmPopupContainer" style="max-width:750px;max-height:500px;margin: 1;text-align: center;padding: 5px;">' +
                      '<a href="#close" id="popupdetailsclose" title="Close" class="modalclose" style="color:#FF0000;">X</a>' +
                      '<table border=0><tr><td><div id="mydivheader"">' + state + ' Reports</div></td></tr>' +
                      '<tr><td>' +
                      '<div style="width:720px; height:450px; overflow:auto;"><table id="reportTable" border=1>' +
                      '<thead><tr><td data-sort-method="none" width=30><b>PL</b></td><th width=394>Description</th><th width=100>Location</th><th data-sort-default width=175>Time</th></tr></thead>' +
                      '<tbody></tbody></table></div>' +
                      '</td></tr></table>' +
                      '</div>'
                     ]);
        $("body").append(popupHTML);
        //Position the modal based on the position of the click event
        $("#gmPopupContainer").css({left: 400});
        $("#gmPopupContainer").css({top: 100});
        $("#gmPopupContainer").show();
        //Add listener for popup's "Close" button
        $("#popupdetailsclose").click ( function () {
            $("#gmPopupContainer").remove ();
            $("#gmPopupContainer").hide ();
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
        W.map.moveTo(new OpenLayers.LonLat(lon,lat).transform(epsg4326,projectTo),6);
    }
    //Initialize Settings
    function initializeSettings()
    {
        for (var i = 0; i < document.getElementsByClassName("DOTreport").length; i++) {
            document.getElementsByClassName("DOTreport")[i].addEventListener('click', function(e) {getReportData(this.getAttribute("id"));}, false);
        }
        loadSettings();
        setChecked('chkPADOTEnabled', settings.PADOTEnabled);
        setChecked('chkDEDOTEnabled', settings.DEDOTEnabled);
        setChecked('chkNYDOTEnabled', settings.NYDOTEnabled);
        setChecked('chkNJDOTEnabled', settings.NJDOTEnabled);
        setChecked('chkWADOTEnabled', settings.WADOTEnabled);
        $(".overlay-button").click(function(){
            if (document.getElementById('chkDEDOTEnabled').checked) { eval('W.map.removeLayer(DEDOTLayer)'); }
            if (document.getElementById('chkNJDOTEnabled').checked) { eval('W.map.removeLayer(NJDOTLayer)'); }
            if (document.getElementById('chkNYDOTEnabled').checked) { eval('W.map.removeLayer(NYDOTLayer)'); }
            if (document.getElementById('chkPADOTEnabled').checked) { eval('W.map.removeLayer(PADOTLayer)'); }
            if (document.getElementById('chkWADOTEnabled').checked) { eval('W.map.removeLayer(WADOTLayer)'); }
            initializeSettings();
        });

        //Add Handler for Checkbox Setting Changes
        $('.WMEDOTAdvSettingsCheckbox').change(function() {
            var settingName = $(this)[0].id.substr(3);
            settings[settingName] = this.checked;
            saveSettings();
            if(this.checked) {
                buildDOTAdvLayers(settingName.substring(0,2));
                eval("get" + settingName.substring(0,2) + "DOT()");
            }
            else
            {
                //eval(settingName.substring(0,2) + "DOTLayer.destroy()");
                eval('W.map.removeLayer(' + settingName.substring(0,2) + 'DOTLayer)');
            }
        });
        if (document.getElementById('WMEFUzoom') != null) {
            document.getElementById('WMEFUzoom').style.zIndex = "45000";
        }
        if (document.getElementById('chkDEDOTEnabled').checked) { buildDOTAdvLayers("DE"); getDEDOT();}
        if (document.getElementById('chkNJDOTEnabled').checked) { buildDOTAdvLayers("NJ"); getNJDOT();}
        if (document.getElementById('chkNYDOTEnabled').checked) { buildDOTAdvLayers("NY"); getNYDOT();}
        if (document.getElementById('chkPADOTEnabled').checked) { buildDOTAdvLayers("PA"); getPADOT();}
        if (document.getElementById('chkWADOTEnabled').checked) { buildDOTAdvLayers("WA"); getWADOT();}
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
            var localsettings = {
                PADOTEnabled: settings.PADOTEnabled,
                DEDOTEnabled: settings.DEDOTEnabled,
                NYDOTEnabled: settings.NYDOTEnabled,
                NJDOTEnabled: settings.NJDOTEnabled,
                WADOTEnabled: settings.WADOTEnabled,
            };
            localStorage.setItem("WMEDOT_Settings", JSON.stringify(localsettings));
        }
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
            initialize: function(a,b,c,d){
                this.url=a;
                this.size=b||{w: 20,h: 20};
                this.offset=c||{x: -(this.size.w/2),y: -(this.size.h/2)};
                this.calculateOffset=d;
                a=OpenLayers.Util.createUniqueID("OL_Icon_");
                let div = this.imageDiv=OpenLayers.Util.createAlphaImageDiv(a);
                $(div.firstChild).removeClass('olAlphaImg'); // LEAVE THIS LINE TO PREVENT WME-HARDHATS SCRIPT FROM TURNING ALL ICONS INTO HARDHAT WAZERS --MAPOMATIC
            },
            destroy: function(){ this.erase();OpenLayers.Event.stopObservingElement(this.imageDiv.firstChild);this.imageDiv.innerHTML="";this.imageDiv=null; },
            clone: function(){ return new OpenLayers.Icon(this.url,this.size,this.offset,this.calculateOffset); },
            setSize: function(a){ null!==a&&(this.size=a); this.draw(); },
            setUrl: function(a){ null!==a&&(this.url=a); this.draw(); },
            draw: function(a){
                OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv,null,null,this.size,this.url,"absolute");
                this.moveTo(a);
                return this.imageDiv;
            },
            erase: function(){ null!==this.imageDiv&&null!==this.imageDiv.parentNode&&OpenLayers.Element.remove(this.imageDiv); },
            setOpacity: function(a){ OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv,null,null,null,null,null,null,null,a); },
            moveTo: function(a){
                null!==a&&(this.px=a);
                null!==this.imageDiv&&(null===this.px?this.display(!1): (
                    this.calculateOffset&&(this.offset=this.calculateOffset(this.size)),
                    OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv,null,{x: this.px.x+this.offset.x,y: this.px.y+this.offset.y})
                ));
            },
            display: function(a){ this.imageDiv.style.display=a?"": "none"; },
            isDrawn: function(){ return this.imageDiv&&this.imageDiv.parentNode&&11!=this.imageDiv.parentNode.nodeType; },
            CLASS_NAME: "OpenLayers.Icon"
        });
    }
    bootstrap();
})();