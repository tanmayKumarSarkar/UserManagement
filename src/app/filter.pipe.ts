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

@Pipe({
  name: 'sortBy'
})
export class SortByPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
