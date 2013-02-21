
/**
 * ���ԃx�[�X�ł̃A�j���[�V�������s���I�u�W�F�N�g�̃C���^�[�t�F�[�X�B
 * ��{�I�ɂ̓��\�b�h�`�F�C���ōs����悤�ɂ���B
 * ��{�I�ȏ����ɂ��ẮATimelineImpl�Ŏ�������Ă���
 */
export interface Timeline {

    // �w�肵���t���[�����������āAx/y�����ړ�����
    moveBy(x: number, y: number, frame: number): Timeline;
    // �w�肵���t���[�������āAx/y�Ɉړ�����
    moveTo(x: number, y: number, frame: number): Timeline;

    // �w�肵���t���[�������āAs�ɃX�P�[������
    scale(s: number, frame: number): Timeline;

    // �w�肵���ʒu�𒆐S�Ƃ��āA�w�肵���t���[�������āAs�ɃX�P�[������
    scaleWithCenter(s: number, x: number, y: number, frame: number): Timeline;
}