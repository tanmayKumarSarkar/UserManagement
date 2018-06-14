import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(arr: any, val?: any): any {
    if(val == undefined || val =='') return arr;
    return arr.filter((obj)=>{
      return obj.name.toLowerCase().includes(val.toLowerCase());
    })
  }

}
