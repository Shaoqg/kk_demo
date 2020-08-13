import PetItem from "./PetItem";
import LoopList, { TableViewDelegate } from "../Util/LoopList";
import PetRevealDialog from "./PetRevealDialog";
import { KKLoader } from "../Util/KKLoader";
import User from "../Gameplay/User";


const { ccclass, property } = cc._decorator;
export class PetData {
    petId: string = "";
    petName: string = "";
    petLevel: number = 1;
}

@ccclass
export default class PetList extends cc.Component {

    @property(cc.Node)
    ContentNode: cc.Node = null;

    @property(cc.Prefab)
    PetItemPrefab: cc.Prefab = null;

    petItems: cc.Node[] = [];

    readonly spacingX = 22;
    readonly spacingY = 22;
    readonly Top = 22;
    readonly left = 22

    async init() {
        // await PetItem.init();

        // let currentPets = GameData.content.pets;
        this.petItems = [];

        let startX = - this.ContentNode.width / 2 + this.left;
        let petConfigs:PetData[] = User.instance.getPetList();


        let scrollView = this.ContentNode.getParent().getComponent(cc.ScrollView);

        let applyData = (node: cc.Node, index: number) => {

            let petData = petConfigs[index];
            console.log(petData);
            
            let y = - Math.floor(index / 4) * (node.height + this.spacingY) - this.Top - node.height / 2;
            let x = (index % 4) * (node.width + this.spacingX) + startX + node.width / 2;
            node.setPosition(x, y);
            let petItem = node.getComponent(PetItem);
            petItem.Init(petData, () => {
                petData && this.onClick(petData, petItem);
            });
        }

        let cellFactory =  async () => {
            let prefab = await KKLoader.loadPrefab("Prefab/PetItem");
            let petItemNode = cc.instantiate(prefab);
            petItemNode.setParent(this.ContentNode);
            this.petItems.push(petItemNode);
            return petItemNode;
        }

        let delegate: TableViewDelegate = {
            dataCount: petConfigs.length,
            cellFactory: cellFactory,
            applyData: applyData,
            viewSetting: {
                scrollView: scrollView,
                gridMode: { xNumber: 4 },
                type: "vertical",
                space: 216 + this.spacingY,
                top_Left: 0,
                buttom_right: scrollView.node.height,
                top_left_space: this.Top,
                buttom_right_space: 0
            }
        }

        let loopList = scrollView.node.addComponent(LoopList);
        loopList.init(delegate);
    }


    onClick(petData: PetData, petItem: PetItem) {
        PetRevealDialog.prompt(null, petData);
    }

    recoveryPetItemAll() {
        if (this.petItems.length >= 0) {
            for (let index = 0; index < this.petItems.length; index++) {
                this.petItems[index].setParent(null)
            }
            this.petItems = [];
        }
    }
}
