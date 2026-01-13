export class filterInterface {
    showing: number = 1;
    icons = {
        show: 'assets/show.svg',
        hide: 'assets/hide.svg',
    };
    get iconGet() {
        return this.showing ? this.icons.hide : this.icons.show;
    }
    hiddenStyleValue: string = '';
    hiddenStyleUpdate(): void {
        this.hiddenStyleValue = this.showing ? 'max-table-h-filter-shown' : 'max-table-h-filter-hidden';
    }
    filterValues: { [key: string]: string } = {};
    toggleInterface() {
        this.showing = 1-this.showing;
        this.hiddenStyleUpdate();
    }
    deleteFilters() {
        for (let key in this.filterValues) {
            this.filterValues[key] = '';
        }
    }
}