import { Component, ViewChild, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Group } from '../../core/groups/group.model';

@Component({
    moduleId: module.id,
    selector: 'ft-group-list',
    templateUrl: 'group-list.component.html',
    styleUrls: ['group-list.component.scss']
})
export class GroupListComponent {
    @Input() public groups: Array<Group> = [];
    @Output() createGroupClick: EventEmitter<any> = new EventEmitter();
    public currentGroup: Group;

    onSelect(group: Group): void {
        this.currentGroup = group;
    }
}
