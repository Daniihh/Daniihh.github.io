let defineProperties=(a,b)=>{Object.defineProperties(a,Object.keys(b).reduce((a,c)=>Object.assign({},a,{[c]:Object.assign({},Object.getOwnPropertyDescriptor(b,c),{enumerable:!1})}),{}))};defineProperties(Symbol,{skip:Symbol("skip")}),defineProperties(Array.prototype,{get last(){return this[Math.max(0,this.length-1)]},set last(a){this[Math.max(0,this.length-1)]=a},crumble(){let a={0:null,1:this[0],default:this};return 1<this.length?a.default:a[this.length]},crumbleFlat(a){return this.flat(a).crumble()},reduceSkip(a,b){let c,d=!1,e=Symbol.skip,f=[];for(let g,h=0;h<this.length;h++){if(g=this[h],!d)if(d=!0,1<arguments.length)c=Object.clone(b);else{c=g;continue}let i=a(c,g,e,h,this);i==e?(f.push(c),d=!1,h--):c=i}return d&&f.push(c),f},softReverse(){let a=[];for(let b of Array.from(this.entries()))a[-1*b[0]+this.length-1]=b[1];return a}}),defineProperties(Object,{clone(a){if("object"!=typeof a)return a;let b=a.constructor;return Object.assign(new b,a)},every(b,c,d){return this.entries(b).every((e,a)=>c.call(d,e,a,b))},filter(b,c,d){return this.fromEntries(this.entries(b).filter((e,a)=>c.call(d,e,a,b)))},getType(a){return Object.getPrototypeOf(a).constructor.name},objectHasOwnProperty(a,b){return[].hasOwnProperty.call(a,b)},objectHasProperty(a,b){let c=[a];for(;null!==this.getPrototypeOf(c.last);)c.push(this.getPrototypeOf(c.last));return c.some(a=>this.objectHasOwnProperty(a,b))}}),defineProperties(String.prototype,{capitalize(){return this.substr(0,1).toUpperCase()+this.substr(1)},escape(){let a=this.split("");return a=a.map(a=>["\"","'","\\"].includes(a)?"\\"+a:a),a.join("")},toTitleCase(){return this.split(" ").map(a=>a.toLowerCase().capitalize()).join(" ")}});class AdvancedError extends Error{constructor(a,b){a instanceof Error&&([a,b]=[void 0,a]),super(),this.description=a,this.name=this.constructor.name,this.stackMap=AdvancedError.parseStack(this.stack),b&&(this.suppressed=b,!(b instanceof AdvancedError)&&(this.suppressedStackMap=AdvancedError.parseStack(b.stack)));let c=a=>({get(){return 1<AdvancedError.parseStack(new Error().stack).length?a:(console.debug("Error thrown: ",this),this.displayedStack)}});Object.defineProperties(this,{stack:c(this.stackMap),message:c(this.description)}),this.displayedStack=AdvancedError.stringifyStack(this)}static extend(a){a=a.capitalize();let{[a]:b}={[a]:class extends this{}};return b}static stringifyStack(a){if(!(a instanceof AdvancedError))return a.stack;let b=[a];for(;a instanceof AdvancedError&&a.suppressed;)b.push(a=a.suppressed);let c,d="";return b.forEach((a,e)=>{let f=a instanceof AdvancedError?a.stackMap:b[e-1].suppressedStackMap,g=Object.clone(f);if(c){let a=c.softReverse(),b=g.softReverse().find((b,c)=>{let d=a[c];return!d||b.methodName!=d.methodName||b.file!=d.file});g.splice(g.indexOf(b)+2)}d+=(0==e?"":"\nCaused by: ")+a.name,a.message&&(d+=": "+a.message),g.forEach(a=>{d+="\n\tat "+a.methodName+" ("+a.file+":"+a.lineNumber+":"+a.column+")"}),g.length<f.length&&(d+="\n\t... "+(f.length-g.length)+" more"),c=f}),d}static parseStack(a){const b=a.split("\n");return b.reduce((a,b)=>{const c=AdvancedError.parseChrome(b)||AdvancedError.parseWinjs(b)||AdvancedError.parseGecko(b)||AdvancedError.parseNode(b)||AdvancedError.parseJSC(b);return c&&a.push(c),a},[])}static parseChrome(a){const b=/^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,c=/\((\S*)(?::(\d+))(?::(\d+))\)/,d=b.exec(a);if(!d)return null;const e=d[2]&&0===d[2].indexOf("native"),f=d[2]&&0===d[2].indexOf("eval"),g=c.exec(d[2]);return f&&null!=g&&(d[2]=g[1],d[3]=g[2],d[4]=g[3]),{file:e?null:d[2],methodName:d[1]||AdvancedError.UNKNOWN_FUNCTION,arguments:e?[d[2]]:[],lineNumber:d[3]?+d[3]:null,column:d[4]?+d[4]:null}}static parseWinjs(a){const b=/^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i,c=b.exec(a);return c?{file:c[2],methodName:c[1]||AdvancedError.UNKNOWN_FUNCTION,arguments:[],lineNumber:+c[3],column:c[4]?+c[4]:null}:null}static parseGecko(a){const b=/^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i,c=/(\S+) line (\d+)(?: > eval line \d+)* > eval/i,d=b.exec(a);if(!d)return null;const e=d[3]&&-1<d[3].indexOf(" > eval"),f=c.exec(d[3]);return e&&null!=f&&(d[3]=f[1],d[4]=f[2],d[5]=null),{file:d[3],methodName:d[1]||AdvancedError.UNKNOWN_FUNCTION,arguments:d[2]?d[2].split(","):[],lineNumber:d[4]?+d[4]:null,column:d[5]?+d[5]:null}}static parseJSC(a){const b=/^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i,c=b.exec(a);return c?{file:c[3],methodName:c[1]||AdvancedError.UNKNOWN_FUNCTION,arguments:[],lineNumber:+c[4],column:c[5]?+c[5]:null}:null}static parseNode(a){const b=/^\s*at (?:((?:\[object object\])?\S+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i,c=b.exec(a);return c?{file:c[2],methodName:c[1]||AdvancedError.UNKNOWN_FUNCTION,arguments:[],lineNumber:+c[3],column:c[4]?+c[4]:null}:null}toString(){return this.displayedStack}}AdvancedError.UNKNOWN_FUNCTION="<unknown>";let AdvancedTypeError=AdvancedError.extend("AdvancedTypeError"),NullError=AdvancedTypeError.extend("NullError"),ArgumentsError=AdvancedError.extend("ArgumentsError");